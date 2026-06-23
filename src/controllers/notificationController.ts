import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as notificationService from "../services/notificationService.js";

export async function listNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationService.getNotificationsByUser(userId);
    res.status(200).json({ notifications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list notifications";
    res.status(400).json({ error: message });
  }
}

export async function getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({ count });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get unread count";
    res.status(400).json({ error: message });
  }
}

export async function markAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const notification = await notificationService.markAsRead(id);
    res.status(200).json({ notification });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to mark as read";
    res.status(400).json({ error: message });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    await notificationService.markAllAsRead(userId);
    res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to mark all as read";
    res.status(400).json({ error: message });
  }
}
