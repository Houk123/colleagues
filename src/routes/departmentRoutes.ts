import { Router } from "express";
import { listDepartments } from "../controllers/departmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listDepartments);

export default router;
