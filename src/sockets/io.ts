import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../shared/types.js";

let _io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function setIo(
  instance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
): void {
  _io = instance;
}

export function getIo(): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  if (!_io) {
    throw new Error("Socket.io not initialized");
  }
  return _io;
}
