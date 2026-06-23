import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import portalRoutes from "./routes/portalRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";

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
app.use(express.json());

const publicPath = path.resolve(__dirname, "../tasks-frontend/dist");
app.use(express.static(publicPath));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/portals", portalRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
