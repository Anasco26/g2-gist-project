import { z } from "zod";
import { Role } from "@prisma/client";

export const userIdParamsSchema = z.object({
  userId: z.string().cuid("Invalid user id"),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and hyphens",
    )
    .optional(),
  email: z.string().trim().email().optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});
