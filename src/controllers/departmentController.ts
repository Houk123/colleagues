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

export async function createDepartment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, managerId, portalId } = req.body;
    if (!name || !portalId) {
      res.status(400).json({ error: "name and portalId are required" });
      return;
    }
    const department = await departmentService.createDepartment({
      name,
      description,
      managerId,
      portalId,
    });
    res.status(201).json({ department });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create department";
    res.status(400).json({ error: message });
  }
}

export async function addDepartmentMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, role } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const member = await departmentService.addDepartmentMember(
      id,
      userId,
      role || "member",
    );
    res.status(201).json({ member });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add member";
    res.status(400).json({ error: message });
  }
}

export async function updateDepartment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, managerId } = req.body;
    const department = await departmentService.updateDepartment(id, {
      name,
      description,
      managerId,
    });
    res.status(200).json({ department });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update department";
    res.status(400).json({ error: message });
  }
}

export async function deleteDepartment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await departmentService.deleteDepartment(id);
    res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete department";
    res.status(400).json({ error: message });
  }
}
