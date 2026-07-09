import type { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import AppError from "../utils/app-error";
import {
  submitContact,
  listMessages,
  markAsRead,
  deleteMessage,
} from "../services/contact.service";

export const submitContactHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      throw new AppError("Name, email, and message are required", 400);
    }

    await submitContact({ name, email, message });

    res.status(201).json({
      status: "success",
      message: "Thank you for reaching out! We'll get back to you.",
    });
  },
);

export const getMessagesHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search || "");
    const readFilter = req.query.read as "read" | "unread" | undefined;
    const result = await listMessages(page, limit, search, readFilter);

    res.status(200).json({
      status: "success",
      results: result.messages.length,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      data: { messages: result.messages },
    });
  },
);

function requireParam(value: string | string[] | undefined, name: string) {
  if (Array.isArray(value)) return value[0];
  if (!value) throw new AppError(`Missing ${name}`, 400);
  return value;
}

export const markMessageReadHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const id = requireParam(req.params.id, "messageId");

    await markAsRead(id);

    res.status(200).json({ status: "success" });
  },
);

export const deleteMessageHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const id = requireParam(req.params.id, "messageId");

    await deleteMessage(id);

    res.status(204).send();
  },
);
