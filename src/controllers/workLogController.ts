import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as workLogService from "../services/workLogService.js";

export async function createWorkLog(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { projectId, taskId, serviceId, description, time, date, phaseId } = req.body;
    if (!projectId || !serviceId || !time || !date) {
      res.status(400).json({ error: "projectId, serviceId, time and date are required" });
      return;
    }
    const workLog = await workLogService.createWorkLog({
      userId,
      projectId,
      taskId,
      serviceId,
      description,
      time: Number(time),
      date,
      phaseId,
    });
    res.status(201).json({ workLog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create work log";
    res.status(400).json({ error: message });
  }
}

export async function listWorkLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { projectId, userId, taskId } = req.query;
    if (projectId && typeof projectId === "string") {
      const logs = await workLogService.getWorkLogsByProject(projectId);
      res.status(200).json({ logs });
      return;
    }
    if (userId && typeof userId === "string") {
      const logs = await workLogService.getWorkLogsByUser(userId);
      res.status(200).json({ logs });
      return;
    }
    if (taskId && typeof taskId === "string") {
      const logs = await workLogService.getWorkLogsByTask(taskId);
      res.status(200).json({ logs });
      return;
    }
    res.status(400).json({ error: "projectId, userId or taskId query parameter is required" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list work logs";
    res.status(400).json({ error: message });
  }
}
