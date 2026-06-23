import api from "@/shared/api/axios.js";

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: { id: string; name: string; email: string };
}

export interface CreateAttachmentInput {
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  taskId?: string;
  commentId?: string;
}

export async function createAttachment(input: CreateAttachmentInput): Promise<Attachment> {
  const { data } = await api.post<{ attachment: Attachment }>("/attachments", input);
  return data.attachment;
}

export async function fetchAttachmentsByTask(taskId: string): Promise<Attachment[]> {
  const { data } = await api.get<{ attachments: Attachment[] }>("/attachments", { params: { taskId } });
  return data.attachments;
}

export async function deleteAttachment(id: string): Promise<void> {
  await api.delete(`/attachments/${id}`);
}
