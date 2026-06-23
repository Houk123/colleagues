import { Router } from "express";
import { createInvite, acceptInvite, listInvites } from "../controllers/inviteController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createInvite);
router.get("/", requireAuth, listInvites);
router.post("/:token/accept", requireAuth, acceptInvite);

export default router;
