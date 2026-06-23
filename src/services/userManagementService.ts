import { prisma } from "../config/db.js";
import { hashPassword } from "../lib/password.js";

export interface CreatePortalUserInput {
  email: string;
  name: string;
  password: string;
  portalId: string;
  roleId: string;
  organizationId?: string;
  departmentId?: string;
  projectAssignments?: { projectId: string; roleId: string }[];
}

export async function getUserRolesInPortal(userId: string, portalId: string) {
  return prisma.userRole.findMany({
    where: { userId, contextId: portalId },
    include: { role: { select: { id: true, name: true, scope: true } } },
  });
}

function isPowerRole(name: string): boolean {
  return ["portal_admin", "portal_manager", "worker_admin", "worker_manager"].includes(name.toLowerCase());
}

function isClientRole(name: string): boolean {
  return name.toLowerCase().includes("client");
}

export async function canAssignRole(creatorRoles: { role: { name: string } }[], targetRoleName: string): Promise<boolean> {
  const creatorHasPower = creatorRoles.some((ur) => isPowerRole(ur.role.name));
  if (creatorHasPower) return true;

  const creatorIsClient = creatorRoles.every((ur) => isClientRole(ur.role.name));
  if (creatorIsClient) {
    return isClientRole(targetRoleName);
  }

  return false;
}

export async function createPortalUser(creatorId: string, input: CreatePortalUserInput) {
  const creatorRoles = await getUserRolesInPortal(creatorId, input.portalId);
  if (creatorRoles.length === 0) {
    const portal = await prisma.portal.findUnique({ where: { id: input.portalId } });
    if (portal?.ownerId !== creatorId) {
      throw new Error("Access denied: you are not a member of this portal");
    }
  }

  const targetRole = await prisma.role.findUnique({ where: { id: input.roleId } });
  if (!targetRole) {
    throw new Error("Role not found");
  }

  const allowed = await canAssignRole(creatorRoles, targetRole.name);
  if (!allowed) {
    throw new Error("Access denied: you cannot assign this role");
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        wallet: { create: { balance: 0, currency: "RUB" } },
      },
    });

    await tx.userRole.create({
      data: {
        userId: user.id,
        roleId: input.roleId,
        scope: "portal",
        contextId: input.portalId,
      },
    });

    if (input.organizationId) {
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: input.organizationId,
          role: "member",
        },
      });
    }

    if (input.departmentId) {
      await tx.userDepartment.create({
        data: {
          userId: user.id,
          departmentId: input.departmentId,
          role: "member",
        },
      });
    }

    if (input.projectAssignments) {
      for (const assignment of input.projectAssignments) {
        const existingMember = await tx.userProject.findUnique({
          where: { userId_projectId: { userId: user.id, projectId: assignment.projectId } },
        });
        if (!existingMember) {
          await tx.userProject.create({
            data: {
              userId: user.id,
              projectId: assignment.projectId,
              roleId: assignment.roleId,
            },
          });
        }
      }
    }

    return tx.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
  });
}
