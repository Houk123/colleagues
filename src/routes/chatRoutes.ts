import { Router } from "express";
import { getProjectRoom, getMessages, sendMessage } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/room", requireAuth, getProjectRoom);
router.get("/:id/messages", requireAuth, getMessages);
router.post("/:id/messages", requireAuth, sendMessage);

export default router;
