import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import app from "./app.js";
import { initSocket } from "./sockets/index.js";
import { setIo } from "./sockets/io.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../shared/types.js";

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setIo(io);
initSocket(io);

const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  const pubClient = createClient({ url: redisUrl });
  const subClient = pubClient.duplicate();
  Promise.all([pubClient.connect(), subClient.connect()])
    .then(() => {
      io.adapter(createAdapter(pubClient, subClient));
      console.log("Socket.IO Redis adapter connected");
    })
    .catch((err) => {
      console.error("Redis adapter connection failed, running in memory mode:", err.message);
    });
}

const PORT = Number(process.env.PORT) || 4000;

function start(): void {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

function shutdown(): void {
  console.log("Shutting down...");
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

void start();
