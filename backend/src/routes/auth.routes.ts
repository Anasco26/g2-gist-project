import { Router } from "express";
import {
  changeMyPassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  register,
  resetPasswordHandler,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validate.middleware";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";

const router = Router();

router.post("/register", validateRequest({ body: registerSchema }), register);
router.post("/login", validateRequest({ body: loginSchema }), login);
router.post("/refresh", validateRequest({ body: refreshTokenSchema }), refresh);
router.post("/logout", validateRequest({ body: refreshTokenSchema }), logout);
router.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword,
);
router.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  resetPasswordHandler,
);
router.get("/me", protect, me);
router.patch(
  "/change-password",
  protect,
  validateRequest({ body: changePasswordSchema }),
  changeMyPassword,
);
router.post("/logout-all", protect, logoutAll);

export default router;
