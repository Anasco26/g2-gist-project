import { Router } from "express";
import { Role } from "@prisma/client";
import {
  deleteMeHandler,
  getUserByIdHandler,
  getUsersHandler,
  updateMeHandler,
  updateUserRoleHandler,
} from "../controllers/user.controller";
import { authorizeRoles, protect } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validate.middleware";
import {
  updateMeSchema,
  updateUserRoleSchema,
  userIdParamsSchema,
} from "../validations/user.validation";

const router = Router();

router.patch(
  "/me",
  protect,
  validateRequest({ body: updateMeSchema }),
  updateMeHandler,
);
router.delete("/me", protect, deleteMeHandler);

router.get(
  "/",
  protect,
  authorizeRoles(Role.ADMIN, Role.MODERATOR),
  getUsersHandler,
);
router.get(
  "/:userId",
  protect,
  authorizeRoles(Role.ADMIN, Role.MODERATOR),
  validateRequest({ params: userIdParamsSchema }),
  getUserByIdHandler,
);
router.patch(
  "/:userId/role",
  protect,
  authorizeRoles(Role.ADMIN),
  validateRequest({ params: userIdParamsSchema, body: updateUserRoleSchema }),
  updateUserRoleHandler,
);

export default router;
