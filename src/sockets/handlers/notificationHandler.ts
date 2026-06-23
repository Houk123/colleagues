import type { Socket, Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  Notification,
} from "../../../shared/types.js";
import { markAsRead } from "../../services/notificationService.js";

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

export function registerNotificationHandler(
  socket: TypedSocket,
  _io: TypedServer,
): void {
  socket.on("markNotificationRead", async (id: string) => {
    try {
      await markAsRead(id);
      console.log(`Notification ${id} marked as read by ${socket.data.userId}`);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  });
}

export function sendNotification(
  io: TypedServer,
  userId: string,
  notification: Omit<Notification, "userId">,
): void {
  io.to(`user:${userId}`).emit("notification", {
    ...notification,
    userId,
  });
}
