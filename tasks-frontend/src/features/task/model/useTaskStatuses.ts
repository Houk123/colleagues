import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProjectStatuses,
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus,
  type ProjectTaskStatus,
} from "../api/taskStatusApi";

export function useProjectStatuses(projectId: string) {
  return useQuery({
    queryKey: ["projectStatuses", projectId],
    queryFn: () => fetchProjectStatuses(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: { name: string; color: string; order: number } }) =>
      createProjectStatus(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses", variables.projectId] });
    },
  });
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ statusId, projectId, input }: { statusId: string; projectId: string; input: { name?: string; color?: string; order?: number } }) =>
      updateProjectStatus(statusId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses", variables.projectId] });
    },
  });
}

export function useDeleteProjectStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ statusId, projectId }: { statusId: string; projectId: string }) => deleteProjectStatus(statusId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectStatuses", variables.projectId] });
    },
  });
}
