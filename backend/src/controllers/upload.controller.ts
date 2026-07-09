import type { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import AppError from "../utils/app-error";
import config from "../config";
import { uploadImage } from "../services/storage.service";

export const uploadImageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    let url: string;

    if (config.isProduction) {
      url = await uploadImage(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname,
      );
    } else {
      url = `/uploads/${req.file.filename}`;
    }

    res.status(200).json({
      status: "success",
      data: { url },
    });
  },
);
