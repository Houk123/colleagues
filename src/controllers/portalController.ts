import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as portalService from "../services/portalService.js";

export async function createPortal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: "name and slug are required" });
      return;
    }

    const portal = await portalService.createPortal({
      name,
      slug,
      description,
      ownerId: req.user!.userId,
    });

    res.status(201).json({ portal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create portal";
    res.status(400).json({ error: message });
  }
}

export async function listPortals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portals = await portalService.getPortalsByUser(req.user!.userId);
    res.status(200).json({ portals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list portals";
    res.status(400).json({ error: message });
  }
}

export async function getPortal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    res.status(200).json({ portal });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get portal";
    res.status(400).json({ error: message });
  }
}

export async function listPortalServices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const services = await portalService.getPortalServices(portal.id);
    res.status(200).json({ services });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list portal services";
    res.status(400).json({ error: message });
  }
}

export async function createPortalService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, pricePerHour, currency } = req.body;
    if (!name || !pricePerHour) {
      res.status(400).json({ error: "name and pricePerHour are required" });
      return;
    }
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const service = await portalService.createService({
      portalId: portal.id,
      name,
      description,
      pricePerHour,
      currency,
    });
    res.status(201).json({ service });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create service";
    res.status(400).json({ error: message });
  }
}

export async function updatePortalService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const serviceId = Array.isArray(req.params.serviceId) ? req.params.serviceId[0] : req.params.serviceId;
    const { name, description, pricePerHour, currency } = req.body;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const service = await portalService.updateService(serviceId, portal.id, {
      name,
      description,
      pricePerHour,
      currency,
    });
    res.status(200).json({ service });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update service";
    res.status(400).json({ error: message });
  }
}

export async function deletePortalService(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const serviceId = Array.isArray(req.params.serviceId) ? req.params.serviceId[0] : req.params.serviceId;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    await portalService.deleteService(serviceId, portal.id);
    res.status(200).json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete service";
    res.status(400).json({ error: message });
  }
}

export async function searchPortals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const query = req.query.q as string | undefined;
    if (!query) {
      res.status(200).json({ portals: [] });
      return;
    }
    const portals = await portalService.searchPortalsBySlug(query);
    res.status(200).json({ portals });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to search portals";
    res.status(400).json({ error: message });
  }
}

export async function createJoinRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { message } = req.body;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const request = await portalService.createJoinRequest(userId, portal.id, message);
    res.status(201).json({ request });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create join request";
    res.status(400).json({ error: message });
  }
}

export async function cancelJoinRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const request = await portalService.cancelJoinRequest(userId, portal.id);
    res.status(200).json({ request });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel join request";
    res.status(400).json({ error: message });
  }
}

export async function getMyJoinRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    let portal = await portalService.getPortalById(id);
    if (!portal) {
      portal = await portalService.getPortalBySlug(id);
    }
    if (!portal) {
      res.status(404).json({ error: "Portal not found" });
      return;
    }
    const request = await portalService.getUserJoinRequest(userId, portal.id);
    res.status(200).json({ request });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get join request";
    res.status(400).json({ error: message });
  }
}

export async function listJoinRequests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const requests = await portalService.getPortalRequestsForAdmin(userId);
    res.status(200).json({ requests });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list join requests";
    res.status(400).json({ error: message });
  }
}

export async function acceptJoinRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { roleId, organizationId, departmentId, autoCreateOrganization, organizationName } = req.body;
    if (!roleId) {
      res.status(400).json({ error: "roleId is required" });
      return;
    }
    const request = await portalService.acceptJoinRequest(id, roleId, {
      organizationId,
      departmentId,
      autoCreateOrganization,
      organizationName,
    });
    res.status(200).json({ request });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to accept request";
    res.status(400).json({ error: message });
  }
}

export async function rejectJoinRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request = await portalService.rejectJoinRequest(id);
    res.status(200).json({ request });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reject request";
    res.status(400).json({ error: message });
  }
}
