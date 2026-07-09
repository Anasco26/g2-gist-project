import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export default function asyncHandler(fn: AsyncController): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
