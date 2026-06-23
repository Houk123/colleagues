import api from "@/shared/api/axios.js";

export interface MonthlyStat {
  id: string;
  projectId: string;
  userId: string | null;
  serviceId: string | null;
  year: number;
  month: number;
  totalMinutes: number;
  totalAmount: string;
  totalTransactions: number;
  currency: string;
  user: { id: string; name: string; email: string } | null;
  service: { id: string; name: string } | null;
}

export interface TaskStat {
  id: string;
  taskId: string;
  projectId: string;
  totalTransactions: number;
  totalMinutes: number;
  totalAmount: string;
  currency: string;
  task: { id: string; title: string };
}

export interface ProjectStatistics {
  monthly: MonthlyStat[];
  taskStats: TaskStat[];
  totalSpent: number;
  totalMinutes: number;
}

export interface UserStatistics {
  monthly: MonthlyStat[];
  totalEarned: number;
  totalMinutes: number;
}

export async function fetchProjectStatistics(projectId: string): Promise<ProjectStatistics> {
  const { data } = await api.get<{ statistics: ProjectStatistics }>(`/statistics/projects/${projectId}`);
  return data.statistics;
}

export async function fetchTaskStatistics(taskId: string): Promise<{ stat: TaskStat }> {
  const { data } = await api.get<{ stat: TaskStat }>(`/statistics/tasks/${taskId}`);
  return data;
}

export async function fetchUserStatistics(): Promise<UserStatistics> {
  const { data } = await api.get<{ statistics: UserStatistics }>("/statistics/me");
  return data.statistics;
}
