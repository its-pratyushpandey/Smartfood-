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

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 5001;

const allowedOrigins = [process.env.CLIENT_ORIGIN, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);

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
