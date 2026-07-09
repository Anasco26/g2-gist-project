import { Router } from "express";
import multer from "multer";
import path from "path";
import config from "../config";
import { protect } from "../middlewares/auth.middleware";
import { uploadImageHandler } from "../controllers/upload.controller";

const storage = config.isProduction
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, "../../uploads"));
      },
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpg, png, gif, webp) are allowed"));
    }
  },
});

const router = Router();

router.post("/", protect, upload.single("image"), uploadImageHandler);

export default router;
