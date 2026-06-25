import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { rateLimit } from "./middleware/rateLimit.js";
import { csrfInit, csrfProtection, csrfTokenEndpoint } from "./middleware/csrf.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import portalRoutes from "./routes/portalRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import workLogRoutes from "./routes/workLogRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import statisticsRoutes from "./routes/statisticsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) ?? [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(rateLimit);
app.use(csrfInit);
app.get("/api/csrf", csrfTokenEndpoint);
app.use(csrfProtection);

const publicPath = path.resolve(__dirname, "../tasks-frontend/dist");
app.use(express.static(publicPath));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portals", portalRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/worklogs", workLogRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/statistics", statisticsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
