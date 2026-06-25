import { Router } from "express";
import {
  createPortal,
  listPortals,
  getPortal,
  listPortalServices,
  createPortalService,
  updatePortalService,
  deletePortalService,
  searchPortals,
  createJoinRequest,
  cancelJoinRequest,
  getMyJoinRequest,
  listJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
} from "../controllers/portalController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createPortal);
router.get("/", requireAuth, listPortals);
router.get("/search", requireAuth, searchPortals);
router.get("/requests", requireAuth, listJoinRequests);
router.get("/:id", requireAuth, getPortal);
router.get("/:id/services", requireAuth, listPortalServices);
router.post("/:id/services", requireAuth, createPortalService);
router.patch("/:id/services/:serviceId", requireAuth, updatePortalService);
router.delete("/:id/services/:serviceId", requireAuth, deletePortalService);
router.get("/:id/join", requireAuth, getMyJoinRequest);
router.post("/:id/join", requireAuth, createJoinRequest);
router.delete("/:id/join", requireAuth, cancelJoinRequest);
router.post("/requests/:id/accept", requireAuth, acceptJoinRequest);
router.post("/requests/:id/reject", requireAuth, rejectJoinRequest);

export default router;
