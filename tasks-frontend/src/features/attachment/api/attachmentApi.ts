import api from "@/shared/api/axios";

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

export async function uploadFile(file: File, taskId?: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);
  if (taskId) formData.append("taskId", taskId);
  const { data } = await api.post<{ attachment: Attachment }>("/attachments/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.attachment;
}
