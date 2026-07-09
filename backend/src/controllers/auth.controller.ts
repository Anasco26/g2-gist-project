import type { Request, Response } from "express";
import config from "../config";
import asyncHandler from "../utils/async-handler";
import logger from "../utils/logger";
import { clearAuthCookies, setAuthCookies } from "../utils/cookies";
import {
  changePassword,
  createPasswordReset,
  getCurrentAuthUser,
  loginUser,
  logoutAllUserSessions,
  logoutUser,
  refreshAuthSession,
  registerUser,
  resetPassword,
} from "../services/auth.service";

function authResponse(
  res: Response,
  payload: { accessToken: string; refreshToken: string; user: unknown },
) {
  setAuthCookies(res, payload.accessToken, payload.refreshToken);
  res.status(200).json({
    status: "success",
    data: {
      user: payload.user,
      accessToken: payload.accessToken,
    },
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, name, password } = req.body;
  const result = await registerUser(
    {
      email,
      username,
      name,
      password,
    },
    {
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    },
  );

  authResponse(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  const result = await loginUser(
    { identifier, password },
    {
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    },
  );

  authResponse(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.[config.cookieNames.refresh] ?? req.body.refreshToken ?? null;
  const result = await refreshAuthSession(refreshToken, {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  });

  authResponse(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.[config.cookieNames.refresh] ?? req.body.refreshToken ?? null;
  await logoutUser(refreshToken);
  clearAuthCookies(res);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: "error", message: "You are not logged in" });
    return;
  }

  await logoutAllUserSessions(req.user.id);
  clearAuthCookies(res);

  res.status(200).json({
    status: "success",
    message: "Logged out from all sessions successfully",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: "error", message: "You are not logged in" });
    return;
  }

  const user = await getCurrentAuthUser(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const changeMyPassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res
        .status(401)
        .json({ status: "error", message: "You are not logged in" });
      return;
    }

    const result = await changePassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    clearAuthCookies(res);
    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await createPasswordReset({
      email: req.body.email,
    });

    if (!config.isProduction && result.resetToken) {
      logger.info("Password reset token generated", {
        email: req.body.email,
        resetToken: result.resetToken,
      });
    }

    res.status(200).json({
      status: "success",
      message: result.message,
      resetToken: config.isProduction ? undefined : result.resetToken,
    });
  },
);

export const resetPasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await resetPassword({
      token: req.body.token,
      password: req.body.password,
    });

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  },
);
