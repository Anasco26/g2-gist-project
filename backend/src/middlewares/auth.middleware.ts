import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../db/prisma";
import config from "../config";
import AppError from "../utils/app-error";
import asyncHandler from "../utils/async-handler";
import { verifyAccessToken } from "../utils/token";
import type { Capability } from "../utils/permissions";
import { hasCapability } from "../utils/permissions";

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
} as const;

function getTokenFromRequest(req: Request) {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  return bearerToken ?? req.cookies?.[config.cookieNames.access] ?? null;
}

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = getTokenFromRequest(req);
    if (!token) {
      throw new AppError("You are not logged in", 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: publicUserSelect,
    });

    if (!user || !user.isActive) {
      throw new AppError(
        "The user belonging to this token no longer exists",
        401,
      );
    }

    req.user = user;
    next();
  },
);

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    return next();
  };
}

export function authorizeCapabilities(...capabilities: Capability[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in", 401));
    }

    const canAccess = capabilities.every((capability) =>
      hasCapability(req.user!.role, capability),
    );
    if (!canAccess) {
      return next(new AppError("You do not have the required capability", 403));
    }

    return next();
  };
}
