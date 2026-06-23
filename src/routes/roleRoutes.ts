import { Router } from "express";
import { listRoles } from "../controllers/roleController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listRoles);

export default router;
