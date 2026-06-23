import type { Socket, Server } from "socket.io";
import type {
  ChatMessage,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../../shared/types.js";

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function registerChatHandler(socket: TypedSocket, io: TypedServer): void {
  socket.on("sendMessage", (message: ChatMessage) => {
    const enriched: ChatMessage = {
      ...message,
      timestamp: Date.now(),
    };
    io.emit("receiveMessage", enriched);
  });

  socket.on("joinRoom", (roomId: string) => {
    void socket.join(roomId);
    socket.to(roomId).emit("userConnected", { userId: socket.data.userId });
  });

  socket.on("leaveRoom", (roomId: string) => {
    void socket.leave(roomId);
    socket.to(roomId).emit("userDisconnected", { userId: socket.data.userId });
  });
}
