import { Router } from "express";
import {
  createProject,
  listProjects,
  getProject,
  getProjectBySlug,
  addMember,
  listPhases,
  createPhase,
  listProjectServices,
  addProjectServiceController,
  listTransactions,
  createTransactionController,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createProject);
router.get("/", requireAuth, listProjects);
router.get("/by-slug", requireAuth, getProjectBySlug);
router.get("/:id", requireAuth, getProject);
router.post("/:id/members", requireAuth, addMember);

router.get("/:id/phases", requireAuth, listPhases);
router.post("/:id/phases", requireAuth, createPhase);

router.get("/:id/services", requireAuth, listProjectServices);
router.post("/:id/services", requireAuth, addProjectServiceController);

router.get("/:id/transactions", requireAuth, listTransactions);
router.post("/:id/transactions", requireAuth, createTransactionController);

export default router;
