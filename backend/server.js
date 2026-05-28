import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes (to be implemented)
// Example: import userRoutes from './routes/userRoutes.js';
// app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Backend server is running at http://${HOST}:${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
