import { Router } from "express";
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  updateTaskAssignee,
  deleteTask,
  createComment,
  listComments,
  addTagToTask,
  removeTagFromTask,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, createTask);
router.get("/", requireAuth, listTasks);
router.get("/:id", requireAuth, getTask);
router.patch("/:id", requireAuth, updateTask);
router.patch("/:id/status", requireAuth, updateTaskStatus);
router.patch("/:id/assignee", requireAuth, updateTaskAssignee);
router.delete("/:id", requireAuth, deleteTask);

router.post("/:id/comments", requireAuth, createComment);
router.get("/:id/comments", requireAuth, listComments);

router.post("/:id/tags", requireAuth, addTagToTask);
router.delete("/:id/tags", requireAuth, removeTagFromTask);

export default router;
