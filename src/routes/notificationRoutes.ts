import { Router } from "express";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, listNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);
router.patch("/mark-all-read", requireAuth, markAllAsRead);
router.patch("/:id/read", requireAuth, markAsRead);

export default router;
