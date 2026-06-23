import { prisma } from "../config/db.js";

export interface CreateAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  taskId?: string;
  commentId?: string;
}

export async function createAttachment(input: CreateAttachmentInput) {
  return prisma.attachment.create({
    data: {
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      uploadedById: input.uploadedById,
      taskId: input.taskId ?? null,
      commentId: input.commentId ?? null,
    },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAttachmentsByTask(taskId: string) {
  return prisma.attachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function getAttachmentsByComment(commentId: string) {
  return prisma.attachment.findMany({
    where: { commentId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deleteAttachment(id: string) {
  return prisma.attachment.delete({ where: { id } });
}
