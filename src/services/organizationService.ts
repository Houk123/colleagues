import prisma from "../config/db.js";

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  billingEmail?: string;
  billingAddress?: string;
  portalId: string;
}

export async function createOrganization(input: CreateOrganizationInput) {
  const existing = await prisma.organization.findUnique({
    where: { portalId_slug: { portalId: input.portalId, slug: input.slug } },
  });
  if (existing) {
    throw new Error("Organization slug already exists in this portal");
  }

  return prisma.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      billingEmail: input.billingEmail,
      billingAddress: input.billingAddress,
      portalId: input.portalId,
    },
  });
}

export async function getOrganizationsByPortal(portalId: string) {
  return prisma.organization.findMany({
    where: { portalId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true, users: true } },
    },
  });
}

export async function getOrganizationById(id: string) {
  return prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      _count: { select: { projects: true } },
    },
  });
}

export async function getOrganizationBySlug(portalId: string, slug: string) {
  return prisma.organization.findUnique({
    where: { portalId_slug: { portalId, slug } },
    include: {
      users: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      _count: { select: { projects: true } },
    },
  });
}

export async function addMember(organizationId: string, userId: string, role: "owner" | "admin" | "member" = "member") {
  const existing = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (existing) {
    throw new Error("User is already a member of this organization");
  }

  return prisma.userOrganization.create({
    data: {
      userId,
      organizationId,
      role,
    },
  });
}
