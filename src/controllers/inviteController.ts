import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as inviteService from "../services/inviteService.js";

export async function createInvite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { email, portalId, projectId, organizationId, roleId, expiresInHours } = req.body;
    if (!email || !portalId || !roleId) {
      res.status(400).json({ error: "email, portalId and roleId are required" });
      return;
    }
    const invite = await inviteService.createInvite({
      email,
      portalId,
      projectId,
      organizationId,
      roleId,
      invitedById: userId,
      expiresInHours,
    });
    res.status(201).json({ invite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create invite";
    res.status(400).json({ error: message });
  }
}

export async function acceptInvite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const invite = await inviteService.acceptInvite(token, userId);
    res.status(200).json({ invite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to accept invite";
    res.status(400).json({ error: message });
  }
}

export async function listInvites(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { portalId } = req.query;
    if (!portalId || typeof portalId !== "string") {
      res.status(400).json({ error: "portalId query parameter is required" });
      return;
    }
    const invites = await inviteService.getInvitesByPortal(portalId);
    res.status(200).json({ invites });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list invites";
    res.status(400).json({ error: message });
  }
}
