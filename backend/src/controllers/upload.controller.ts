import type { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import AppError from "../utils/app-error";

export const uploadImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const url = `/uploads/${req.file.filename}`;

    res.status(200).json({
      status: "success",
      data: { url },
    });
  },
);
