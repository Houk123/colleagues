import api from "@/shared/api/axios.js";

export interface WorkLog {
  id: string;
  userId: string;
  projectId: string;
  taskId: string | null;
  serviceId: string;
  description: string | null;
  time: number;
  date: string;
  amount: string | null;
  resolvedRate: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  service: { id: string; name: string; pricePerHour: string };
  task: { id: string; title: string } | null;
}

export interface CreateWorkLogInput {
  projectId: string;
  taskId?: string;
  serviceId: string;
  description?: string;
  time: number;
  date: string;
  phaseId?: string;
}

export async function createWorkLog(input: CreateWorkLogInput): Promise<WorkLog> {
  const { data } = await api.post<{ workLog: WorkLog }>("/worklogs", input);
  return data.workLog;
}

export async function fetchWorkLogs(projectId: string): Promise<WorkLog[]> {
  const { data } = await api.get<{ logs: WorkLog[] }>("/worklogs", { params: { projectId } });
  return data.logs;
}

export async function fetchWorkLogsByTask(taskId: string): Promise<WorkLog[]> {
  const { data } = await api.get<{ logs: WorkLog[] }>("/worklogs", { params: { taskId } });
  return data.logs;
}
