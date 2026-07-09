import { Prisma, Role } from "@prisma/client";
import prisma from "../db/prisma";
import AppError from "../utils/app-error";

export const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  name: true,
  role: true,
  isActive: true,
  isEmailVerified: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });
}

export async function listUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMe(
  userId: string,
  data: { name?: string; username?: string; email?: string },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: publicUserSelect,
  });
}

export async function setUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: publicUserSelect,
  });
}

export async function deactivateUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
}

export async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
