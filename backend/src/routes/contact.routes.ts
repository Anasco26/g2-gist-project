import { Router } from "express";
import { Role } from "@prisma/client";
import { protect, authorizeRoles } from "../middlewares/auth.middleware";
import {
  submitContactHandler,
  getMessagesHandler,
  markMessageReadHandler,
  deleteMessageHandler,
} from "../controllers/contact.controller";

const router = Router();

router.post("/", submitContactHandler);

router.get(
  "/",
  protect,
  authorizeRoles(Role.ADMIN, Role.MODERATOR),
  getMessagesHandler,
);
router.patch(
  "/:id/read",
  protect,
  authorizeRoles(Role.ADMIN, Role.MODERATOR),
  markMessageReadHandler,
);
router.delete(
  "/:id",
  protect,
  authorizeRoles(Role.ADMIN),
  deleteMessageHandler,
);

export default router;
