import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createWorkLog, fetchWorkLogs, fetchWorkLogsByTask, type CreateWorkLogInput } from "../api/workLogApi";

export function useWorkLogs(projectId: string) {
  return useQuery({
    queryKey: ["worklogs", projectId],
    queryFn: () => fetchWorkLogs(projectId),
    enabled: !!projectId,
  });
}

export function useWorkLogsByTask(taskId: string) {
  return useQuery({
    queryKey: ["worklogs", "task", taskId],
    queryFn: () => fetchWorkLogsByTask(taskId),
    enabled: !!taskId,
  });
}

export function useCreateWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkLogInput) => createWorkLog(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["worklogs", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
