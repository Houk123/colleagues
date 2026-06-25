import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import * as roleService from "../services/roleService.js";

const ALLOWED_ROLE_NAMES = new Set([
  "employee_admin",
  "employee_manager",
  "employee_executor",
  "client_owner",
  "client_worker",
]);

export async function listRoles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const roles = await roleService.getRoles();
    const filtered = roles.filter((r) => ALLOWED_ROLE_NAMES.has(r.name.toLowerCase()));
    res.status(200).json({ roles: filtered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list roles";
    res.status(400).json({ error: message });
  }
}
