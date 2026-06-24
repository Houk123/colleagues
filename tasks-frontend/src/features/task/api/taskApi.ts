import api from "@/shared/api/axios.js";

export interface Task {
  id: string;
  projectId: string;
  authorId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  criticalId: string | null;
  categoryId: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  comments: { id: string }[];
  taskTags: { id: string; tag: { id: string; name: string; color: string | null } }[];
}

export interface TaskDetail extends Task {
  comments: {
    id: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    attachments: unknown[];
  }[];
  workLogs: unknown[];
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  dueDate?: string;
  categoryId?: string;
  criticalId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assigneeId?: string | null;
  dueDate?: string | null;
  categoryId?: string | null;
  criticalId?: string | null;
  status?: "todo" | "in_progress" | "review" | "done" | "cancelled";
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  attachments: unknown[];
}

export async function fetchTasks(projectId: string): Promise<Task[]> {
  const { data } = await api.get<{ tasks: Task[] }>("/tasks", { params: { projectId } });
  return data.tasks;
}

export async function fetchTask(taskId: string): Promise<TaskDetail> {
  const { data } = await api.get<{ task: TaskDetail }>(`/tasks/${taskId}`);
  return data.task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<{ task: Task }>("/tasks", input);
  return data.task;
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const { data } = await api.patch<{ task: Task }>(`/tasks/${taskId}`, input);
  return data.task;
}

export async function updateTaskStatus(taskId: string, status: Task["status"]): Promise<Task> {
  const { data } = await api.patch<{ task: Task }>(`/tasks/${taskId}/status`, { status });
  return data.task;
}

export async function updateTaskAssignee(taskId: string, assigneeId: string | null): Promise<Task> {
  const { data } = await api.patch<{ task: Task }>(`/tasks/${taskId}/assignee`, { assigneeId });
  return data.task;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}

export async function fetchComments(taskId: string): Promise<Comment[]> {
  const { data } = await api.get<{ comments: Comment[] }>(`/tasks/${taskId}/comments`);
  return data.comments;
}

export async function createComment(taskId: string, text: string): Promise<Comment> {
  const { data } = await api.post<{ comment: Comment }>(`/tasks/${taskId}/comments`, { text });
  return data.comment;
}

export interface Tag {
  id: string;
  portalId: string;
  name: string;
  color: string | null;
}

export async function fetchTags(portalId: string): Promise<Tag[]> {
  const { data } = await api.get<{ tags: Tag[] }>("/tags", { params: { portalId } });
  return data.tags;
}

export async function createTag(input: { portalId: string; name: string; color?: string }): Promise<Tag> {
  const { data } = await api.post<{ tag: Tag }>("/tags", input);
  return data.tag;
}

export async function addTagToTask(taskId: string, tagId: string): Promise<void> {
  await api.post(`/tasks/${taskId}/tags`, { tagId });
}

export async function removeTagFromTask(taskId: string, tagId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}/tags`, { data: { tagId } });
}
