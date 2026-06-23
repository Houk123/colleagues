import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as taskService from "../services/taskService.js";
import * as commentService from "../services/commentService.js";
import * as tagService from "../services/tagService.js";
import * as portalService from "../services/portalService.js";
import { getIo } from "../sockets/io.js";
import { createAuditLog } from "../services/auditLogService.js";
import * as notificationService from "../services/notificationService.js";

async function isPortalOwner(userId: string, portalId: string): Promise<boolean> {
  const portal = await portalService.getPortalById(portalId);
  return portal?.ownerId === userId;
}

export async function createTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { projectId, title, description, priority, assigneeId, dueDate, categoryId, criticalId } = req.body;
    if (!projectId || !title) {
      res.status(400).json({ error: "projectId and title are required" });
      return;
    }
    const task = await taskService.createTask({
      projectId,
      authorId: userId,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
      categoryId,
      criticalId,
    });
    getIo().to(`project:${task.projectId}`).emit("taskCreated", {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      updatedAt: task.updatedAt.toISOString(),
    });
    await createAuditLog({
      entityType: "task",
      entityId: task.id,
      action: "create",
      userId,
      newValue: { title, description, priority, assigneeId, status: task.status },
    });
    if (task.assigneeId) {
      const notification = await notificationService.createNotification({
        userId: task.assigneeId,
        type: "task_assigned",
        title: "Вам назначена задача",
        body: task.title,
        entityType: "task",
        entityId: task.id,
      });
      getIo().to(`user:${task.assigneeId}`).emit("notification", notification);
    }
    res.status(201).json({ task });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create task";
    res.status(400).json({ error: message });
  }
}

export async function listTasks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId } = req.query;
    if (!projectId || typeof projectId !== "string") {
      res.status(400).json({ error: "projectId query parameter is required" });
      return;
    }
    const tasks = await taskService.getTasksByProject(projectId);
    res.status(200).json({ tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list tasks";
    res.status(400).json({ error: message });
  }
}

export async function getTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.status(200).json({ task });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get task";
    res.status(400).json({ error: message });
  }
}

export async function updateTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, priority, assigneeId, dueDate, categoryId, criticalId, status } = req.body;
    const oldTask = await taskService.getTaskById(id);
    if (!oldTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const oldValue = { title: oldTask.title, description: oldTask.description, priority: oldTask.priority, assigneeId: oldTask.assigneeId, status: oldTask.status };
    const task = await taskService.updateTask(id, {
      title,
      description,
      priority,
      assigneeId,
      dueDate,
      categoryId,
      criticalId,
      status,
    });
    getIo().to(`project:${task.projectId}`).emit("taskUpdated", {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      updatedAt: task.updatedAt.toISOString(),
    });
    await createAuditLog({
      entityType: "task",
      entityId: task.id,
      action: "update",
      userId,
      oldValue,
      newValue: { title, description, priority, assigneeId, status },
    });
    res.status(200).json({ task });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update task";
    res.status(400).json({ error: message });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "status is required" });
      return;
    }
    const oldTask = await taskService.getTaskById(id);
    const task = await taskService.updateTask(id, { status });
    getIo().to(`project:${task.projectId}`).emit("taskUpdated", {
      id: task.id,
      projectId: task.projectId,
      status: task.status,
      updatedAt: task.updatedAt.toISOString(),
    });
    await createAuditLog({
      entityType: "task",
      entityId: task.id,
      action: "update",
      userId,
      oldValue: { status: oldTask?.status },
      newValue: { status },
    });
    res.status(200).json({ task });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update task status";
    res.status(400).json({ error: message });
  }
}

export async function updateTaskAssignee(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { assigneeId } = req.body;
    const oldTask = await taskService.getTaskById(id);
    const task = await taskService.updateTask(id, { assigneeId: assigneeId ?? null });
    getIo().to(`project:${task.projectId}`).emit("taskUpdated", {
      id: task.id,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      updatedAt: task.updatedAt.toISOString(),
    });
    await createAuditLog({
      entityType: "task",
      entityId: task.id,
      action: "update",
      userId,
      oldValue: { assigneeId: oldTask?.assigneeId },
      newValue: { assigneeId: assigneeId ?? null },
    });
    if (task.assigneeId && task.assigneeId !== oldTask?.assigneeId) {
      const notification = await notificationService.createNotification({
        userId: task.assigneeId,
        type: "task_assigned",
        title: "Вам назначена задача",
        body: task.title,
        entityType: "task",
        entityId: task.id,
      });
      getIo().to(`user:${task.assigneeId}`).emit("notification", notification);
    }
    res.status(200).json({ task });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update assignee";
    res.status(400).json({ error: message });
  }
}

export async function deleteTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await taskService.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    await taskService.deleteTask(id);
    getIo().to(`project:${task.projectId}`).emit("taskDeleted", {
      id: task.id,
      projectId: task.projectId,
    });
    await createAuditLog({
      entityType: "task",
      entityId: task.id,
      action: "delete",
      userId,
      oldValue: { title: task.title, status: task.status },
    });
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete task";
    res.status(400).json({ error: message });
  }
}

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const task = await taskService.getTaskById(id);
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const comment = await commentService.createComment({ taskId: id, userId, text });
    getIo().to(`project:${task.projectId}`).emit("commentCreated", {
      id: comment.id,
      taskId: comment.taskId,
      text: comment.text,
      userId: comment.userId,
      createdAt: comment.createdAt.toISOString(),
    });
    await createAuditLog({
      entityType: "comment",
      entityId: comment.id,
      action: "create",
      userId,
      newValue: { text, taskId: id },
    });
    const notifyUserIds = new Set<string>();
    if (task.assigneeId && task.assigneeId !== userId) notifyUserIds.add(task.assigneeId);
    if (task.authorId && task.authorId !== userId) notifyUserIds.add(task.authorId);
    for (const targetUserId of notifyUserIds) {
      const notification = await notificationService.createNotification({
        userId: targetUserId,
        type: "comment",
        title: "Новый комментарий к задаче",
        body: `${task.title}: ${text}`,
        entityType: "task",
        entityId: task.id,
      });
      getIo().to(`user:${targetUserId}`).emit("notification", notification);
    }
    res.status(201).json({ comment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create comment";
    res.status(400).json({ error: message });
  }
}

export async function listComments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comments = await commentService.getCommentsByTask(id);
    res.status(200).json({ comments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list comments";
    res.status(400).json({ error: message });
  }
}

export async function addTagToTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { tagId } = req.body;
    if (!tagId) {
      res.status(400).json({ error: "tagId is required" });
      return;
    }
    const taskTag = await tagService.addTagToTask(id, tagId);
    res.status(201).json({ taskTag });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add tag";
    res.status(400).json({ error: message });
  }
}

export async function removeTagFromTask(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { tagId } = req.body;
    if (!tagId) {
      res.status(400).json({ error: "tagId is required" });
      return;
    }
    await tagService.removeTagFromTask(id, tagId);
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove tag";
    res.status(400).json({ error: message });
  }
}
