import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import * as chatService from "../services/chatService.js";
import { getIo } from "../sockets/io.js";

export async function getProjectRoom(req: AuthRequest, res: Response): Promise<void> {
  try {
    const projectId = req.query.projectId as string;
    if (!projectId) {
      res.status(400).json({ error: "projectId is required" });
      return;
    }
    const room = await chatService.getRoomByProject(projectId);
    if (!room) {
      const roomId = await chatService.getOrCreateProjectRoom(projectId);
      const newRoom = await chatService.getRoomByProject(projectId);
      res.status(200).json({ room: newRoom });
      return;
    }
    res.status(200).json({ room });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get room";
    res.status(400).json({ error: message });
  }
}

export async function getMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const messages = await chatService.getMessages(roomId);
    res.status(200).json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get messages";
    res.status(400).json({ error: message });
  }
}

export async function sendMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.userId;
    const { text } = req.body;
    if (!text) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const message = await chatService.sendMessage(roomId, userId, text);
    getIo().to(`room:${roomId}`).emit("chatMessage", {
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    } as any);
    res.status(201).json({ message });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send message";
    res.status(400).json({ error: message });
  }
}
