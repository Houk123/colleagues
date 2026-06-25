import { useQuery } from "@tanstack/react-query";
import { fetchProjectStatistics, fetchTaskStatistics, fetchUserStatistics } from "../api/statisticsApi";

export function useProjectStatistics(projectId: string) {
  return useQuery({
    queryKey: ["statistics", "project", projectId],
    queryFn: () => fetchProjectStatistics(projectId),
    enabled: !!projectId,
  });
}

export function useTaskStatistics(taskId: string) {
  return useQuery({
    queryKey: ["statistics", "task", taskId],
    queryFn: () => fetchTaskStatistics(taskId),
    enabled: !!taskId,
  });
}

export function useUserStatistics() {
  return useQuery({
    queryKey: ["statistics", "me"],
    queryFn: fetchUserStatistics,
  });
}
