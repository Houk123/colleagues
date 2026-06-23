import { prisma } from "../config/db.js";

export async function getDepartmentsByPortal(portalId: string) {
  return prisma.department.findMany({
    where: { portalId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
}
