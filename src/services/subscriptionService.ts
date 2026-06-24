import { prisma } from "../config/db.js";

export async function createSubscription(
  userId: string,
  entityType: "task" | "project" | "room",
  entityId: string,
  type: "email" | "push" | "socket" = "socket",
) {
  const existing = await prisma.subscription.findUnique({
    where: {
      userId_entityType_entityId: { userId, entityType, entityId },
    },
  });
  if (existing) return existing;
  return prisma.subscription.create({
    data: { userId, entityType, entityId, type },
  });
}

export async function deleteSubscription(
  userId: string,
  entityType: "task" | "project" | "room",
  entityId: string,
) {
  return prisma.subscription.delete({
    where: {
      userId_entityType_entityId: { userId, entityType, entityId },
    },
  });
}

export async function getSubscriptions(userId: string) {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubscriptionsByEntity(
  entityType: "task" | "project" | "room",
  entityId: string,
) {
  return prisma.subscription.findMany({
    where: { entityType, entityId },
  });
}
