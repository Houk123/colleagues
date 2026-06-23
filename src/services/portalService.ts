import prisma from "../config/db.js";

export interface CreatePortalInput {
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

export async function createPortal(input: CreatePortalInput) {
  const existing = await prisma.portal.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new Error("Portal slug already exists");
  }

  return prisma.$transaction(async (tx) => {
    const portal = await tx.portal.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        ownerId: input.ownerId,
      },
    });

    const adminRole = await tx.role.findUnique({
      where: { name: "portal_admin" },
    });
    if (adminRole) {
      await tx.userRole.create({
        data: {
          userId: input.ownerId,
          roleId: adminRole.id,
          scope: "portal",
          contextId: portal.id,
        },
      });
    }

    return portal;
  });
}

export async function getPortalsByUser(userId: string) {
  const owned = await prisma.portal.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  const memberProjects = await prisma.userProject.findMany({
    where: { userId },
    include: { project: { include: { portal: true } } },
  });

  const userRoles = await prisma.userRole.findMany({
    where: { userId, scope: "portal" },
    select: { contextId: true },
  });

  const userOrganizations = await prisma.userOrganization.findMany({
    where: { userId },
    include: { organization: { select: { portalId: true } } },
  });

  const memberPortalIds = new Set<string>([
    ...memberProjects.map((up) => up.project.portalId),
    ...userRoles.map((ur) => ur.contextId),
    ...userOrganizations.map((uo) => uo.organization.portalId),
  ]);

  const memberPortals = await prisma.portal.findMany({
    where: { id: { in: Array.from(memberPortalIds) } },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, (typeof owned)[0]>();
  [...owned, ...memberPortals].forEach((p) => map.set(p.id, p));
  return Array.from(map.values());
}

export async function getPortalById(id: string) {
  return prisma.portal.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { projects: true, organizations: true } },
    },
  });
}

export async function getPortalBySlug(slug: string) {
  return prisma.portal.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { projects: true, organizations: true } },
    },
  });
}

export async function getPortalServices(portalId: string) {
  return prisma.service.findMany({
    where: { portalId },
    orderBy: { createdAt: "desc" },
  });
}

export interface CreateServiceInput {
  portalId: string;
  name: string;
  description?: string;
  pricePerHour: number;
  currency?: string;
}

export async function createService(input: CreateServiceInput) {
  return prisma.service.create({
    data: {
      portalId: input.portalId,
      name: input.name,
      description: input.description,
      pricePerHour: input.pricePerHour,
      currency: input.currency ?? "RUB",
    },
  });
}

export async function createJoinRequest(userId: string, portalId: string, message?: string) {
  const existing = await prisma.portalRequest.findUnique({
    where: { userId_portalId: { userId, portalId } },
  });
  if (existing?.status === "pending") {
    throw new Error("Request already pending");
  }
  if (existing) {
    await prisma.portalRequest.delete({
      where: { id: existing.id },
    });
  }
  return prisma.portalRequest.create({
    data: { userId, portalId, message, status: "pending" },
    include: { portal: { select: { id: true, name: true, slug: true } }, user: { select: { id: true, name: true, email: true } } },
  });
}

export async function cancelJoinRequest(userId: string, portalId: string) {
  const existing = await prisma.portalRequest.findUnique({
    where: { userId_portalId: { userId, portalId } },
  });
  if (!existing || existing.status !== "pending") {
    throw new Error("No pending request found");
  }
  return prisma.portalRequest.delete({
    where: { id: existing.id },
    include: { portal: { select: { id: true, name: true, slug: true } } },
  });
}

export async function getUserJoinRequest(userId: string, portalId: string) {
  return prisma.portalRequest.findUnique({
    where: { userId_portalId: { userId, portalId } },
    include: { portal: { select: { id: true, name: true, slug: true } } },
  });
}

export async function getPortalRequestsForAdmin(adminUserId: string) {
  const ownedPortalIds = await prisma.portal.findMany({
    where: { ownerId: adminUserId },
    select: { id: true },
  });
  const ids = ownedPortalIds.map((p) => p.id);
  if (ids.length === 0) return [];

  return prisma.portalRequest.findMany({
    where: { portalId: { in: ids }, status: "pending" },
    include: {
      portal: { select: { id: true, name: true, slug: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptJoinRequest(
  requestId: string,
  roleId: string,
  options?: { organizationId?: string; departmentId?: string; autoCreateOrganization?: boolean; organizationName?: string }
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.portalRequest.findUnique({
      where: { id: requestId },
      include: { user: { select: { id: true, name: true, email: true } }, portal: { select: { id: true, name: true } } },
    });
    if (!request || request.status !== "pending") {
      throw new Error("Request not found or already processed");
    }

    const role = await tx.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error("Role not found");
    }

    await tx.userRole.create({
      data: {
        userId: request.userId,
        roleId,
        scope: "portal",
        contextId: request.portalId,
      },
    });

    let assignedOrganizationId: string | undefined = options?.organizationId;

    if (options?.autoCreateOrganization || role.name.toLowerCase().includes("client")) {
      const orgName = options?.organizationName?.trim() || request.user.name || request.user.email.split("@")[0];
      const orgSlug = `${orgName}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const organization = await tx.organization.create({
        data: {
          portalId: request.portalId,
          name: orgName,
          slug: orgSlug,
        },
      });
      await tx.userOrganization.create({
        data: {
          userId: request.userId,
          organizationId: organization.id,
          role: "owner",
        },
      });
      assignedOrganizationId = organization.id;
    } else if (options?.organizationId) {
      await tx.userOrganization.create({
        data: {
          userId: request.userId,
          organizationId: options.organizationId,
          role: "member",
        },
      });
    }

    if (options?.departmentId) {
      await tx.userDepartment.create({
        data: {
          userId: request.userId,
          departmentId: options.departmentId,
          role: "member",
        },
      });
    }

    await tx.portalRequest.update({
      where: { id: requestId },
      data: { status: "accepted" },
    });

    return {
      ...request,
      assignedOrganizationId,
    };
  });
}

export async function rejectJoinRequest(requestId: string) {
  return prisma.portalRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
    include: { user: { select: { id: true, name: true, email: true } }, portal: { select: { id: true, name: true } } },
  });
}

export async function searchPortalsBySlug(query: string) {
  return prisma.portal.findMany({
    where: { slug: { contains: query, mode: "insensitive" } },
    take: 10,
    select: { id: true, name: true, slug: true, description: true },
  });
}
