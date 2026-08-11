import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const isRenderDeployment = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID || process.env.RENDER_EXTERNAL_URL);

if (!isRenderDeployment && process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 5001;

const clientOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim()) : [];

const allowedOrigins = [
  ...clientOrigins,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://smartfood-frontend-sigma.vercel.app",
  "https://smartfood-frontend-hetki17sk-pratyushs-projects-f95291d2.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Smartfood API is running" });
});

app.use("/api/suppliers", supplierRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Smartfood server listening on port ${port}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});