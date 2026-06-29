import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";

const DEFAULT_STATUSES = [
  { name: "todo",        color: "#9ca3af", order: 0, isDefault: true },
  { name: "in_progress", color: "#3b82f6", order: 1, isDefault: true },
  { name: "review",      color: "#a855f7", order: 2, isDefault: true },
  { name: "done",        color: "#22c55e", order: 3, isDefault: true },
  { name: "cancelled",   color: "#ef4444", order: 4, isDefault: true },
];

export async function seedDefaultStatuses(projectId: string) {
  const existing = await prisma.projectTaskStatus.count({ where: { projectId } });
  if (existing > 0) return;
  await prisma.projectTaskStatus.createMany({
    data: DEFAULT_STATUSES.map((s) => ({ ...s, projectId })),
  });
}

export async function listStatuses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const statuses = await prisma.projectTaskStatus.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });
    res.json({ statuses });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch statuses" });
  }
}

export async function createStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const { name, color, order } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const status = await prisma.projectTaskStatus.create({
      data: {
        projectId,
        name,
        color: color ?? "#9ca3af",
        order: order ?? 99,
        isDefault: false,
      },
    });
    res.status(201).json({ status });
  } catch (err) {
    res.status(400).json({ error: "Failed to create status" });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const statusId = Array.isArray(req.params.statusId) ? req.params.statusId[0] : req.params.statusId;
    const { name, color, order } = req.body;
    const status = await prisma.projectTaskStatus.update({
      where: { id: statusId },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
      },
    });
    res.json({ status });
  } catch (err) {
    res.status(400).json({ error: "Failed to update status" });
  }
}

export async function deleteStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const statusId = Array.isArray(req.params.statusId) ? req.params.statusId[0] : req.params.statusId;
    const status = await prisma.projectTaskStatus.findUnique({ where: { id: statusId } });
    if (!status) { res.status(404).json({ error: "Status not found" }); return; }
    if (status.isDefault) { res.status(400).json({ error: "Cannot delete default status" }); return; }
    await prisma.projectTaskStatus.delete({ where: { id: statusId } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete status" });
  }
}
