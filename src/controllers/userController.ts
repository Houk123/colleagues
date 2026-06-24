import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import * as userModel from "../models/user.js";
import { AuthRequest } from "../middleware/auth.js";
import { prisma } from "../config/db.js";
import * as userManagementService from "../services/userManagementService.js";

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userModel.getUserById(Array.isArray(id) ? id[0] : id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, name } = req.body as { email?: string; name?: string };
    if (!email || !name) {
      res.status(400).json({ error: "email and name are required" });
      return;
    }
    const user = await userModel.createUser(email, name);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function listPortalUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portalId = req.query.portalId as string | undefined;
    if (!portalId) {
      res.status(400).json({ error: "portalId is required" });
      return;
    }
    const portal = await prisma.portal.findUnique({ where: { id: portalId } });
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const userIds = new Set<string>([portal.ownerId]);
    const roles = await prisma.userRole.findMany({
      where: { contextId: portalId },
      select: { userId: true },
    });
    roles.forEach((r) => userIds.add(r.userId));
    const orgMembers = await prisma.userOrganization.findMany({
      where: { organization: { portalId } },
      select: { userId: true },
    });
    orgMembers.forEach((o) => userIds.add(o.userId));

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, email: true, name: true, avatar: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list portal users";
    res.status(400).json({ error: message });
  }
}

export async function createPortalUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const creatorId = req.user!.userId;
    const { email, name, password, portalId, roleId, organizationId, departmentId, projectAssignments } = req.body;
    if (!email || !name || !password || !portalId || !roleId) {
      res.status(400).json({ error: "email, name, password, portalId and roleId are required" });
      return;
    }
    const user = await userManagementService.createPortalUser(creatorId, {
      email,
      name,
      password,
      portalId,
      roleId,
      organizationId,
      departmentId,
      projectAssignments,
    });
    res.status(201).json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    res.status(403).json({ error: message });
  }
}

export async function listCreatableRoles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const portalId = req.query.portalId as string | undefined;
    if (!portalId) {
      res.status(400).json({ error: "portalId is required" });
      return;
    }
    const allRoles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    const portal = await prisma.portal.findUnique({ where: { id: portalId } });
    if (portal?.ownerId === userId) {
      res.status(200).json({ roles: allRoles });
      return;
    }
    const creatorRoles = await userManagementService.getUserRolesInPortal(userId, portalId);
    const creatorHasPower = creatorRoles.some((ur) =>
      ["portal_admin", "portal_manager", "worker_admin", "worker_manager"].includes(ur.role.name.toLowerCase())
    );
    if (creatorHasPower) {
      res.status(200).json({ roles: allRoles });
      return;
    }
    const creatorIsClient = creatorRoles.length > 0 && creatorRoles.every((ur) => ur.role.name.toLowerCase().includes("client"));
    if (creatorIsClient) {
      res.status(200).json({ roles: allRoles.filter((r: Role) => r.name.toLowerCase().includes("client")) });
      return;
    }
    res.status(200).json({ roles: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list roles";
    res.status(400).json({ error: message });
  }
}

export async function assignRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { roleId, scope, contextId } = req.body;
    if (!roleId || !scope || !contextId) {
      res.status(400).json({ error: "roleId, scope and contextId are required" });
      return;
    }
    const existing = await prisma.userRole.findFirst({
      where: { userId: targetUserId, scope, contextId },
    });
    if (existing) {
      const updated = await prisma.userRole.update({
        where: { id: existing.id },
        data: { roleId },
        include: { role: true },
      });
      res.status(200).json({ userRole: updated });
      return;
    }
    const userRole = await prisma.userRole.create({
      data: { userId: targetUserId, roleId, scope, contextId },
      include: { role: true },
    });
    res.status(201).json({ userRole });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to assign role";
    res.status(400).json({ error: message });
  }
}

export async function listUserRoles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const targetUserId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userRoles = await prisma.userRole.findMany({
      where: { userId: targetUserId },
      include: { role: true },
    });
    res.status(200).json({ userRoles });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list user roles";
    res.status(400).json({ error: message });
  }
}
