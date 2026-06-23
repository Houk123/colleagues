import { Router } from "express";
import {
  createOrganization,
  listOrganizations,
  getOrganization,
  getOrganizationBySlug,
  addMember,
} from "../controllers/organizationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createOrganization);
router.get("/", requireAuth, listOrganizations);
router.get("/by-slug", requireAuth, getOrganizationBySlug);
router.get("/:id", requireAuth, getOrganization);
router.post("/:id/members", requireAuth, addMember);

export default router;
