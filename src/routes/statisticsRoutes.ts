import { Router } from "express";
import {
  getProjectStatistics,
  getTaskStatistics,
  getUserStatistics,
} from "../controllers/statisticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/projects/:id", requireAuth, getProjectStatistics);
router.get("/tasks/:id", requireAuth, getTaskStatistics);
router.get("/me", requireAuth, getUserStatistics);

export default router;
