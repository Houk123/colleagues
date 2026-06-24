import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as tagService from "../services/tagService.js";

export async function listTags(req: AuthRequest, res: Response): Promise<void> {
  try {
    const portalId = req.query.portalId as string | undefined;
    if (!portalId) {
      res.status(400).json({ error: "portalId is required" });
      return;
    }
    const tags = await tagService.getTagsByPortal(portalId);
    res.status(200).json({ tags });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list tags";
    res.status(400).json({ error: message });
  }
}

export async function createTag(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, color, portalId } = req.body;
    if (!name || !portalId) {
      res.status(400).json({ error: "name and portalId are required" });
      return;
    }
    const tag = await tagService.createTag({ name, color, portalId });
    res.status(201).json({ tag });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create tag";
    res.status(400).json({ error: message });
  }
}
