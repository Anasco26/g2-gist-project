import type { Request, Response } from "express";
import asyncHandler from "../utils/async-handler";
import {
  assertUserExists,
  deactivateUser,
  findUserById,
  listUsers,
  setUserRole,
  updateMe,
} from "../services/user.service";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: "error", message: "You are not logged in" });
    return;
  }

  const user = await assertUserExists(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateMeHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res
        .status(401)
        .json({ status: "error", message: "You are not logged in" });
      return;
    }

    const user = await updateMe(req.user.id, req.body);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

export const deleteMeHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res
        .status(401)
        .json({ status: "error", message: "You are not logged in" });
      return;
    }

    await deactivateUser(req.user.id);
    res.status(204).send();
  },
);

export const getUsersHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const users = await listUsers();
    res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
    });
  },
);

export const getUserByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ status: "error", message: "User not found" });
      return;
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);

export const updateUserRoleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const user = await setUserRole(userId, req.body.role);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  },
);
