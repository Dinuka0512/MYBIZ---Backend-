// @ts-ignore
import dotenv from "dotenv";
// @ts-ignore
import express from "express";
// @ts-ignore
import cors from "cors";

import userRoutes from "./routes/userRoues";

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT || 5000;

const app = express();

// ✅ Parse JSON
app.use(express.json());

// ✅ CORS CONFIGURATION
const allowedOrigins = ["*"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ ROUTES
app.use("/api/v1/user", userRoutes);

export default app;