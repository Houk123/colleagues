import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as projectService from "../services/projectService.js";
import * as portalService from "../services/portalService.js";
import { prisma } from "../config/db.js";
import { seedDefaultStatuses } from "./taskStatusController.js";

async function isPortalOwner(userId: string, portalId: string): Promise<boolean> {
  const portal = await portalService.getPortalById(portalId);
  return portal?.ownerId === userId;
}

async function isEmployee(userId: string, portalId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workerProfile: { select: { id: true } } },
  });
  if (user?.workerProfile) return true;
  const owner = await isPortalOwner(userId, portalId);
  return owner;
}

async function getClientProjectIds(userId: string, portalId: string): Promise<{ organizationIds: string[]; projectIds: string[] }> {
  const orgMemberships = await prisma.userOrganization.findMany({
    where: { userId, organization: { portalId } },
    select: { organizationId: true },
  });
  const assignments = await prisma.userProject.findMany({
    where: { userId, project: { portalId } },
    select: { projectId: true },
  });
  return {
    organizationIds: orgMemberships.map((o) => o.organizationId),
    projectIds: assignments.map((a) => a.projectId),
  };
}

async function canAccessProject(userId: string, project: { portalId: string; organizationId: string | null; id: string }): Promise<boolean> {
  const owner = await isPortalOwner(userId, project.portalId);
  if (owner) return true;

  const employee = await isEmployee(userId, project.portalId);
  if (employee) return true;

  const { organizationIds, projectIds } = await getClientProjectIds(userId, project.portalId);
  if (projectIds.length > 0) {
    return projectIds.includes(project.id);
  }
  if (organizationIds.length > 0 && project.organizationId) {
    return organizationIds.includes(project.organizationId);
  }
  return false;
}

export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description, portalId, organizationId } = req.body;
    if (!name || !portalId || !organizationId) {
      res.status(400).json({ error: "name, portalId and organizationId are required" });
      return;
    }

    const project = await projectService.createProject({
      name,
      description,
      portalId,
      organizationId,
    });

    await seedDefaultStatuses(project.id);

    res.status(201).json({ project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    res.status(400).json({ error: message });
  }
}

export async function listProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { portalId, organizationId } = req.query;
    if (!portalId || typeof portalId !== "string") {
      res.status(400).json({ error: "portalId query parameter is required" });
      return;
    }
    const owner = await isPortalOwner(userId, portalId);
    const employee = await isEmployee(userId, portalId);
    let projects = await projectService.getProjectsByPortal(
      portalId,
      typeof organizationId === "string" ? organizationId : undefined,
    );
    if (!owner && !employee) {
      const { organizationIds, projectIds } = await getClientProjectIds(userId, portalId);
      projects = projects.filter((p) => {
        if (projectIds.length > 0) return projectIds.includes(p.id);
        if (organizationIds.length > 0 && p.organizationId) return organizationIds.includes(p.organizationId);
        return false;
      });
    }
    res.status(200).json({ projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list projects";
    res.status(400).json({ error: message });
  }
}

export async function getProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await projectService.getProjectById(id);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const allowed = await canAccessProject(userId, project);
    if (!allowed) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    res.status(200).json({ project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get project";
    res.status(400).json({ error: message });
  }
}

export async function getProjectBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { portalId, slug } = req.query;
    if (!portalId || typeof portalId !== "string" || !slug || typeof slug !== "string") {
      res.status(400).json({ error: "portalId and slug query parameters are required" });
      return;
    }
    const project = await projectService.getProjectBySlug(portalId, slug);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const allowed = await canAccessProject(userId, project);
    if (!allowed) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    res.status(200).json({ project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get project by slug";
    res.status(400).json({ error: message });
  }
}

export async function addMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, roleId } = req.body;
    if (!userId || !roleId) {
      res.status(400).json({ error: "userId and roleId are required" });
      return;
    }
    const member = await projectService.addMember(id, userId, roleId);
    res.status(201).json({ member });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add member";
    res.status(400).json({ error: message });
  }
}

export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, organizationId } = req.body;
    const project = await projectService.updateProject(id, { name, description, organizationId });
    res.status(200).json({ project });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update project";
    res.status(400).json({ error: message });
  }
}

export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await projectService.deleteProject(id);
    res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete project";
    res.status(400).json({ error: message });
  }
}

export async function listPhases(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const phases = await projectService.getProjectPhases(id);
    res.status(200).json({ phases });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list phases";
    res.status(400).json({ error: message });
  }
}

export async function createPhase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, type, pricingMode, budgetTotal, paymentMode, installmentAmount, billingPeriod, currency } = req.body;
    if (!name || !type || !pricingMode) {
      res.status(400).json({ error: "name, type and pricingMode are required" });
      return;
    }
    const phase = await projectService.createPhase({
      projectId: id,
      name,
      type,
      pricingMode,
      budgetTotal,
      paymentMode,
      installmentAmount,
      billingPeriod,
      currency,
    });
    res.status(201).json({ phase });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create phase";
    res.status(400).json({ error: message });
  }
}

export async function listProjectServices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const services = await projectService.getProjectServices(id);
    res.status(200).json({ services });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list project services";
    res.status(400).json({ error: message });
  }
}

export async function addProjectServiceController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { serviceId, customPricePerHour, discountPercent, enabled } = req.body;
    if (!serviceId) {
      res.status(400).json({ error: "serviceId is required" });
      return;
    }
    const service = await projectService.addProjectService({
      projectId: id,
      serviceId,
      customPricePerHour,
      discountPercent,
      enabled,
    });
    res.status(201).json({ service });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add project service";
    res.status(400).json({ error: message });
  }
}

export async function listTransactions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const transactions = await projectService.getProjectTransactions(id);
    res.status(200).json({ transactions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list transactions";
    res.status(400).json({ error: message });
  }
}

export async function createTransactionController(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { amount, description, type } = req.body;
    if (!amount || !type) {
      res.status(400).json({ error: "amount and type are required" });
      return;
    }
    const transaction = await projectService.createTransaction({
      projectId: id,
      amount,
      description,
      type,
    });
    res.status(201).json({ transaction });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create transaction";
    res.status(400).json({ error: message });
  }
}
