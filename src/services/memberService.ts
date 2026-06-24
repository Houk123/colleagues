import { prisma } from "../config/db.js";

export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "member",
) {
  const existing = await prisma.userOrganization.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (existing) {
    throw new Error("User is already a member of this organization");
  }

  return prisma.userOrganization.create({
    data: { userId, organizationId, role },
  });
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  roleId: string,
) {
  const existing = await prisma.userProject.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (existing) {
    throw new Error("User is already a member of this project");
  }

  return prisma.userProject.create({
    data: { userId, projectId, roleId },
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
    data: { userId, departmentId, role },
  });
}

export async function removeOrganizationMember(organizationId: string, userId: string) {
  return prisma.userOrganization.delete({
    where: { userId_organizationId: { userId, organizationId } },
  });
}

export async function removeProjectMember(projectId: string, userId: string) {
  return prisma.userProject.delete({
    where: { userId_projectId: { userId, projectId } },
  });
}

export async function removeDepartmentMember(departmentId: string, userId: string) {
  return prisma.userDepartment.delete({
    where: { userId_departmentId: { userId, departmentId } },
  });
}

export async function getOrganizationMembers(organizationId: string) {
  return prisma.userOrganization.findMany({
    where: { organizationId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}

export async function getProjectMembers(projectId: string) {
  return prisma.userProject.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      role: { select: { id: true, name: true } },
    },
  });
}

export async function getDepartmentMembers(departmentId: string) {
  return prisma.userDepartment.findMany({
    where: { departmentId },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });
}
