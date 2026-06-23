import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as statisticsService from "../services/statisticsService.js";

export async function getProjectStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stats = await statisticsService.getProjectStatistics(id);
    res.status(200).json({ statistics: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get project statistics";
    res.status(400).json({ error: message });
  }
}

export async function getTaskStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const stat = await statisticsService.getTaskStatistics(id);
    if (!stat) {
      res.status(404).json({ error: "Statistics not found" });
      return;
    }
    res.status(200).json({ stat });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get task statistics";
    res.status(400).json({ error: message });
  }
}

export async function getUserStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const stats = await statisticsService.getUserStatistics(userId);
    res.status(200).json({ statistics: stats });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get user statistics";
    res.status(400).json({ error: message });
  }
}
