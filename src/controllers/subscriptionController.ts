import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as subscriptionService from "../services/subscriptionService.js";

export async function subscribe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { entityType, entityId, type } = req.body;
    if (!entityType || !entityId) {
      res.status(400).json({ error: "entityType and entityId are required" });
      return;
    }
    const sub = await subscriptionService.createSubscription(
      userId,
      entityType,
      entityId,
      type ?? "socket",
    );
    res.status(201).json({ subscription: sub });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to subscribe";
    res.status(400).json({ error: message });
  }
}

export async function unsubscribe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { entityType, entityId } = req.body;
    if (!entityType || !entityId) {
      res.status(400).json({ error: "entityType and entityId are required" });
      return;
    }
    await subscriptionService.deleteSubscription(userId, entityType, entityId);
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to unsubscribe";
    res.status(400).json({ error: message });
  }
}

export async function listSubscriptions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const subs = await subscriptionService.getSubscriptions(userId);
    res.status(200).json({ subscriptions: subs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list subscriptions";
    res.status(400).json({ error: message });
  }
}
