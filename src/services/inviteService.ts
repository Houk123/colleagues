import { prisma } from "../config/db.js";
import crypto from "crypto";

export interface CreateInviteInput {
  email: string;
  portalId: string;
  projectId?: string;
  organizationId?: string;
  roleId: string;
  invitedById: string;
  expiresInHours?: number;
}

export async function createInvite(input: CreateInviteInput) {
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (input.expiresInHours ?? 168)); // 7 days default

  return prisma.invite.create({
    data: {
      email: input.email,
      portalId: input.portalId,
      projectId: input.projectId ?? null,
      organizationId: input.organizationId ?? null,
      roleId: input.roleId,
      invitedById: input.invitedById,
      token,
      expiresAt,
    },
    include: { role: true },
  });
}

export async function getInviteByToken(token: string) {
  return prisma.invite.findUnique({
    where: { token },
    include: { portal: true, project: true, organization: true, role: true },
  });
}

export async function acceptInvite(token: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const invite = await tx.invite.findUnique({ where: { token } });
    if (!invite) throw new Error("Invite not found");
    if (invite.status !== "pending") throw new Error("Invite already processed");
    if (invite.expiresAt < new Date()) throw new Error("Invite expired");

    await tx.invite.update({
      where: { id: invite.id },
      data: { status: "accepted" },
    });

    await tx.userRole.create({
      data: { userId, roleId: invite.roleId, scope: "portal", contextId: invite.portalId },
    });

    if (invite.projectId) {
      await tx.userProject.upsert({
        where: { userId_projectId: { userId, projectId: invite.projectId } },
        update: {},
        create: { userId, projectId: invite.projectId, roleId: invite.roleId },
      });
    }

    if (invite.organizationId) {
      await tx.userOrganization.upsert({
        where: { userId_organizationId: { userId, organizationId: invite.organizationId } },
        update: {},
        create: { userId, organizationId: invite.organizationId, role: "member" },
      });
    }

    return invite;
  });
}

export async function getInvitesByPortal(portalId: string) {
  return prisma.invite.findMany({
    where: { portalId },
    orderBy: { createdAt: "desc" },
    include: { role: true, invitedBy: { select: { id: true, name: true, email: true } } },
  });
}
