import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { getAuditLogs } from "../services/auditLogService.js";

export async function listAuditLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { entityType, entityId, userId } = req.query;
    const logs = await getAuditLogs(
      typeof entityType === "string" ? entityType : undefined,
      typeof entityId === "string" ? entityId : undefined,
      typeof userId === "string" ? userId : undefined,
    );
    res.status(200).json({ logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list audit logs";
    res.status(400).json({ error: message });
  }
}
