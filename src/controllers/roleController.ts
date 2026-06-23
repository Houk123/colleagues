import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import * as roleService from "../services/roleService.js";

export async function listRoles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const roles = await roleService.getRoles();
    res.status(200).json({ roles });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list roles";
    res.status(400).json({ error: message });
  }
}
