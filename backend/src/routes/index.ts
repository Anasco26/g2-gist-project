import { Router } from "express";
import authRoutes from "./auth.routes";
import blogRoutes from "./blog.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/users", userRoutes);

export default router;
