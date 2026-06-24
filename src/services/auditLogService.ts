import { prisma } from "../config/db.js";

export type AuditEntityType = "task" | "comment" | "project";
export type AuditAction = "create" | "update" | "delete";

export interface CreateAuditLogInput {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  userId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  return prisma.auditLog.create({
    data: {
      entityType: input.entityType as any,
      entityId: input.entityId,
      action: input.action as any,
      userId: input.userId,
      oldValue: (input.oldValue ?? undefined) as any,
      newValue: (input.newValue ?? undefined) as any,
    },
  });
}

export async function getAuditLogs(entityType?: string, entityId?: string, userId?: string) {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType: entityType as any } : {}),
      ...(entityId ? { entityId } : {}),
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
