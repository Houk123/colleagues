import { Router } from "express";
import { createAttachment, listAttachments, deleteAttachment } from "../controllers/attachmentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createAttachment);
router.get("/", requireAuth, listAttachments);
router.delete("/:id", requireAuth, deleteAttachment);

export default router;
