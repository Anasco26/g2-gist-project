import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/app-error";
import logger from "../utils/logger";

function normalizeError(error: unknown) {
  if (error instanceof AppError) {
    return error;
  }

  const err = error as {
    code?: string;
    name?: string;
    message?: string;
    stack?: string;
  };

  if (err?.name === "ZodError") {
    return new AppError("Validation failed", 400, err.message);
  }

  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return new AppError("Invalid or expired token", 401);
  }

  if (err?.code === "P2002") {
    return new AppError("A record with these details already exists", 409);
  }

  if (err?.code === "P2025") {
    return new AppError("Requested record was not found", 404);
  }

  return new AppError(err?.message ?? "Internal server error", 500);
}

export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const normalizedError = normalizeError(error);

  logger.error("Request failed", {
    method: req.method,
    path: req.originalUrl,
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    stack: normalizedError.stack,
  });

  const response: Record<string, unknown> = {
    status: "error",
    message: normalizedError.message,
  };

  if (normalizedError.details !== undefined) {
    response.errors = normalizedError.details;
  }

  res.status(normalizedError.statusCode).json(response);
}
