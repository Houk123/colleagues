import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "../types.js";

interface ServerToClientEvents {
  receiveMessage: (message: ChatMessage) => void;
  notification: (notification: unknown) => void;
}

interface ClientToServerEvents {
  sendMessage: (message: ChatMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  markNotificationRead: (id: string) => void;
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
