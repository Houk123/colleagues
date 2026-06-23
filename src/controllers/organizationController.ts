import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as organizationService from "../services/organizationService.js";

export async function createOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, slug, description, billingEmail, billingAddress, portalId } = req.body;
    if (!name || !slug || !portalId) {
      res.status(400).json({ error: "name, slug and portalId are required" });
      return;
    }

    const organization = await organizationService.createOrganization({
      name,
      slug,
      description,
      billingEmail,
      billingAddress,
      portalId,
    });

    res.status(201).json({ organization });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create organization";
    res.status(400).json({ error: message });
  }
}

export async function listOrganizations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { portalId } = req.query;
    if (!portalId || typeof portalId !== "string") {
      res.status(400).json({ error: "portalId query parameter is required" });
      return;
    }
    const organizations = await organizationService.getOrganizationsByPortal(portalId);
    res.status(200).json({ organizations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list organizations";
    res.status(400).json({ error: message });
  }
}

export async function getOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const organization = await organizationService.getOrganizationById(id);
    if (!organization) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    res.status(200).json({ organization });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get organization";
    res.status(400).json({ error: message });
  }
}

export async function getOrganizationBySlug(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { portalId, slug } = req.query;
    if (!portalId || typeof portalId !== "string" || !slug || typeof slug !== "string") {
      res.status(400).json({ error: "portalId and slug query parameters are required" });
      return;
    }
    const organization = await organizationService.getOrganizationBySlug(portalId, slug);
    if (!organization) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    res.status(200).json({ organization });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get organization by slug";
    res.status(400).json({ error: message });
  }
}

export async function addMember(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { userId, role } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }
    const member = await organizationService.addMember(id, userId, role);
    res.status(201).json({ member });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add member";
    res.status(400).json({ error: message });
  }
}
