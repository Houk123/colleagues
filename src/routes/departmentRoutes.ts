import { Router } from "express";
import {
  listDepartments,
  createDepartment,
  addDepartmentMember,
} from "../controllers/departmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listDepartments);
router.post("/", requireAuth, createDepartment);
router.post("/:id/members", requireAuth, addDepartmentMember);

export default router;
