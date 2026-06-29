import api from "@/shared/api/axios";

export interface ProjectTaskStatus {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export async function fetchProjectStatuses(projectId: string): Promise<ProjectTaskStatus[]> {
  const { data } = await api.get<{ statuses: ProjectTaskStatus[] }>(`/projects/${projectId}/statuses`);
  return data.statuses;
}

export async function createProjectStatus(
  projectId: string,
  input: { name: string; color: string; order: number }
): Promise<ProjectTaskStatus> {
  const { data } = await api.post<{ status: ProjectTaskStatus }>(`/projects/${projectId}/statuses`, input);
  return data.status;
}

export async function updateProjectStatus(
  statusId: string,
  input: { name?: string; color?: string; order?: number }
): Promise<ProjectTaskStatus> {
  const { data } = await api.patch<{ status: ProjectTaskStatus }>(`/projects/statuses/${statusId}`, input);
  return data.status;
}

export async function deleteProjectStatus(statusId: string): Promise<void> {
  await api.delete(`/projects/statuses/${statusId}`);
}
