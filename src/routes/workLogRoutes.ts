import { Router } from "express";
import { createWorkLog, listWorkLogs } from "../controllers/workLogController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createWorkLog);
router.get("/", requireAuth, listWorkLogs);

export default router;
