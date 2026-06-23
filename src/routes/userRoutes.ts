import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", userController.listUsers);
router.get("/portal", requireAuth, userController.listPortalUsers);
router.get("/creatable-roles", requireAuth, userController.listCreatableRoles);
router.get("/:id", userController.getUser);
router.post("/", userController.createUser);
router.post("/portal", requireAuth, userController.createPortalUser);

export default router;
