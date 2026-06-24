import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAttachment, fetchAttachmentsByTask, deleteAttachment, uploadFile, type CreateAttachmentInput } from "../api/attachmentApi.js";

export function useAttachmentsByTask(taskId: string) {
  return useQuery({
    queryKey: ["attachments", "task", taskId],
    queryFn: () => fetchAttachmentsByTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAttachmentInput) => createAttachment(input),
    onSuccess: (_, variables) => {
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: ["attachments", "task", variables.taskId] });
      }
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, taskId }: { file: File; taskId?: string }) => uploadFile(file, taskId),
    onSuccess: (_, variables) => {
      if (variables.taskId) {
        queryClient.invalidateQueries({ queryKey: ["attachments", "task", variables.taskId] });
      }
    },
  });
}
