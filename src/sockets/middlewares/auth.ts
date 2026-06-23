import type { Socket, ExtendedError } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function socketAuth(
  socket: Socket,
  next: (err?: ExtendedError) => void,
): void {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.replace("Bearer ", "");

  if (!token || typeof token !== "string") {
    const userId =
      (socket.handshake.auth.userId as string | undefined) ||
      `anon-${socket.id}`;
    socket.data = { userId, email: "" };
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    socket.data = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(new Error("Invalid token"));
  }
}
