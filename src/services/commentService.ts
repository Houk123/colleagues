import prisma from "../config/db.js";

export interface CreateCommentInput {
  taskId: string;
  userId: string;
  text: string;
}

export async function createComment(input: CreateCommentInput) {
  return prisma.comment.create({
    data: {
      taskId: input.taskId,
      userId: input.userId,
      text: input.text,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });
}

export async function getCommentsByTask(taskId: string) {
  return prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      attachments: true,
    },
  });
}
