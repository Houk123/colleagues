import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import * as departmentService from "../services/departmentService.js";

export async function listDepartments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portalId = req.query.portalId as string | undefined;
    if (!portalId) {
      res.status(400).json({ error: "portalId is required" });
      return;
    }
    const departments = await departmentService.getDepartmentsByPortal(portalId);
    res.status(200).json({ departments });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list departments";
    res.status(400).json({ error: message });
  }
}
