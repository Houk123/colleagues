import { Router } from "express";
import { listTags, createTag } from "../controllers/tagController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listTags);
router.post("/", requireAuth, createTag);

export default router;
