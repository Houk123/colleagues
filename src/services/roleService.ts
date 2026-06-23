import { prisma } from "../config/db.js";

export async function getRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, scope: true, permissions: true },
  });
}
