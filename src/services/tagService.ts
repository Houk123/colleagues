import prisma from "../config/db.js";

export interface CreateTagInput {
  portalId: string;
  name: string;
  color?: string;
}

export async function createTag(input: CreateTagInput) {
  return prisma.tag.create({
    data: {
      portalId: input.portalId,
      name: input.name,
      color: input.color,
    },
  });
}

export async function getTagsByPortal(portalId: string) {
  return prisma.tag.findMany({
    where: { portalId },
    orderBy: { name: "asc" },
  });
}

export async function addTagToTask(taskId: string, tagId: string) {
  return prisma.taskTag.create({
    data: { taskId, tagId },
    include: { tag: true },
  });
}

export async function removeTagFromTask(taskId: string, tagId: string) {
  return prisma.taskTag.delete({
    where: { taskId_tagId: { taskId, tagId } },
  });
}
