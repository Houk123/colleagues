import { Router } from "express";
import { subscribe, unsubscribe, listSubscriptions } from "../controllers/subscriptionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, subscribe);
router.delete("/", requireAuth, unsubscribe);
router.get("/", requireAuth, listSubscriptions);

export default router;
