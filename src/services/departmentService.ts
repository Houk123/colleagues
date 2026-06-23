import { prisma } from "../config/db.js";

export async function getDepartmentsByPortal(portalId: string) {
  return prisma.department.findMany({
    where: { portalId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
}

export interface CreateDepartmentInput {
  name: string;
  description?: string;
  managerId?: string;
  portalId: string;
}

export async function createDepartment(input: CreateDepartmentInput) {
  return prisma.department.create({
    data: {
      name: input.name,
      description: input.description,
      managerId: input.managerId,
      portalId: input.portalId,
    },
  });
}

export async function addDepartmentMember(
  departmentId: string,
  userId: string,
  role: "manager" | "member" = "member",
) {
  const existing = await prisma.userDepartment.findUnique({
    where: { userId_departmentId: { userId, departmentId } },
  });
  if (existing) {
    throw new Error("User is already a member of this department");
  }

  return prisma.userDepartment.create({
    data: {
      userId,
      departmentId,
      role,
    },
  });
}
