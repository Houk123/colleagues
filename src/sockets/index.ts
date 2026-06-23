import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../shared/types.js";
import { socketAuth } from "./middlewares/auth.js";
import { registerChatHandler } from "./handlers/chatHandler.js";
import { registerNotificationHandler } from "./handlers/notificationHandler.js";
import { registerTaskHandler } from "./handlers/taskHandler.js";

export function initSocket(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
): void {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id, socket.data.userId);

    void socket.join(`user:${socket.data.userId}`);

    registerChatHandler(socket, io);
    registerNotificationHandler(socket, io);
    registerTaskHandler(socket, io);

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
}
