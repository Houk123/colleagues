import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "../types.js";

interface TaskEventPayload {
  id: string;
  projectId: string;
  status?: string;
  assigneeId?: string | null;
  title?: string;
  priority?: string;
  updatedAt?: string;
}

interface CommentEventPayload {
  id: string;
  taskId: string;
  text: string;
  userId: string;
  createdAt?: string;
}

interface ChatMessagePayload {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar: string | null };
}

interface ServerToClientEvents {
  receiveMessage: (message: ChatMessage) => void;
  notification: (notification: unknown) => void;
  taskCreated: (payload: TaskEventPayload) => void;
  taskUpdated: (payload: TaskEventPayload) => void;
  taskDeleted: (payload: { id: string; projectId: string }) => void;
  commentCreated: (payload: CommentEventPayload) => void;
  chatMessage: (payload: ChatMessagePayload) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: ChatMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  markNotificationRead: (id: string) => void;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: { userId: userId ?? undefined },
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return socketRef;
}
