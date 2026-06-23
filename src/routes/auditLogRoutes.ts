import { Router } from "express";
import { listAuditLogs } from "../controllers/auditLogController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listAuditLogs);

export default router;
