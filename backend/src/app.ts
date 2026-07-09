import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";
import contactRoutes from "./routes/contact.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import logger, { morganStream } from "./utils/logger";
import config from "./config";

const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: config.isProduction
      ? [config.frontendUrl].filter(Boolean)
      : true,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use(
  morgan(config.isProduction ? "combined" : "dev", { stream: morganStream }),
);
app.use(globalLimiter);

if (!config.isProduction) {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the MovieBlog API",
  });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/contact", contactRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

logger.info("Express app initialized");

export default app;
