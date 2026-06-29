import { Router } from "express";
import { listStatuses, createStatus, updateStatus, deleteStatus } from "../controllers/taskStatusController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.get("/", requireAuth, listStatuses);
router.post("/", requireAuth, createStatus);
router.patch("/:statusId", requireAuth, updateStatus);
router.delete("/:statusId", requireAuth, deleteStatus);

export default router;
