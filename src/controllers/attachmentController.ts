import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as attachmentService from "../services/attachmentService.js";

export async function createAttachment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { fileName, fileUrl, fileSize, mimeType, taskId, commentId } = req.body;
    if (!fileName || !fileUrl) {
      res.status(400).json({ error: "fileName and fileUrl are required" });
      return;
    }
    const attachment = await attachmentService.createAttachment({
      fileName,
      fileUrl,
      fileSize: fileSize ?? 0,
      mimeType: mimeType ?? "application/octet-stream",
      uploadedById: userId,
      taskId,
      commentId,
    });
    res.status(201).json({ attachment });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create attachment";
    res.status(400).json({ error: message });
  }
}

export async function listAttachments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { taskId, commentId } = req.query;
    if (taskId && typeof taskId === "string") {
      const attachments = await attachmentService.getAttachmentsByTask(taskId);
      res.status(200).json({ attachments });
      return;
    }
    if (commentId && typeof commentId === "string") {
      const attachments = await attachmentService.getAttachmentsByComment(commentId);
      res.status(200).json({ attachments });
      return;
    }
    res.status(400).json({ error: "taskId or commentId query parameter is required" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list attachments";
    res.status(400).json({ error: message });
  }
}

export async function deleteAttachment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await attachmentService.deleteAttachment(id);
    res.status(204).send();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete attachment";
    res.status(400).json({ error: message });
  }
}
