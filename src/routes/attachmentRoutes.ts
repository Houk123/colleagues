import { Router } from "express";
import multer from "multer";
import path from "path";
import { createAttachment, listAttachments, deleteAttachment, uploadFile } from "../controllers/attachmentController.js";
import { requireAuth } from "../middleware/auth.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

router.post("/upload", requireAuth, upload.single("file"), uploadFile as any);
router.post("/", requireAuth, createAttachment);
router.get("/", requireAuth, listAttachments);
router.delete("/:id", requireAuth, deleteAttachment);

export default router;
