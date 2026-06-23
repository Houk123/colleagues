import type { Socket, Server } from "socket.io";
import type {
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

export function registerTaskHandler(socket: TypedSocket, _io: TypedServer): void {
  socket.on("joinProject", (projectId: string) => {
    void socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project:${projectId}`);
  });

  socket.on("leaveProject", (projectId: string) => {
    void socket.leave(`project:${projectId}`);
    console.log(`Socket ${socket.id} left project:${projectId}`);
  });
}
