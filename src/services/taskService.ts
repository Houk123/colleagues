import prisma from "../config/db.js";

export interface CreateTaskInput {
  projectId: string;
  authorId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  assigneeId?: string;
  dueDate?: string;
  categoryId?: string;
  criticalId?: string;
}

export async function createTask(input: CreateTaskInput) {
  return prisma.task.create({
    data: {
      projectId: input.projectId,
      authorId: input.authorId,
      title: input.title,
      description: input.description,
      priority: input.priority ?? "medium",
      assigneeId: input.assigneeId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      categoryId: input.categoryId,
      criticalId: input.criticalId,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      taskTags: { include: { tag: true } },
    },
  });
}

export async function getTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: { select: { id: true } },
      taskTags: { include: { tag: true } },
    },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
      },
      taskTags: { include: { tag: true } },
      workLogs: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
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

export async function updateTask(id: string, input: UpdateTaskInput) {
  return prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.criticalId !== undefined && { criticalId: input.criticalId }),
      ...(input.status !== undefined && { status: input.status }),
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      taskTags: { include: { tag: true } },
    },
  });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}
