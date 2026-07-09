import bcrypt from "bcrypt";
import prisma from "../db/prisma";
import config from "../config";
import AppError from "../utils/app-error";
import { parseDurationToMs } from "../utils/duration";
import {
  createAccessToken,
  createRefreshToken,
  generateRandomToken,
  hashToken,
  verifyRefreshToken,
} from "../utils/token";
import { publicUserSelect, type PublicUser } from "./user.service";

type SessionMeta = {
  ipAddress: string | null;
  userAgent: string | null;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

const refreshExpiryMs = parseDurationToMs(config.jwtRefreshExpiresIn);
const resetExpiryMs = parseDurationToMs(config.jwtResetExpiresIn);

function buildTokenPayload(user: PublicUser) {
  return {
    sub: user.id,
    email: user.email,
    username: user.username || "",
    role: user.role,
  };
}

async function createSession(
  user: PublicUser,
  meta: SessionMeta,
): Promise<AuthTokens> {
  const payload = buildTokenPayload(user);
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshExpiryMs),
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    },
  });

  return { accessToken, refreshToken, user };
}

async function revokeRefreshToken(rawToken?: string | null) {
  if (!rawToken) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

export async function registerUser(
  input: {
    email: string;
    username?: string;
    name?: string;
    password: string;
  },
  meta: SessionMeta,
): Promise<AuthTokens> {
  const email = input.email.trim().toLowerCase();
  const username = input.username?.trim().toLowerCase() || null;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, ...(username ? [{ username }] : [])],
    },
  });

  if (existingUser) {
    throw new AppError("Email or username already in use", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      username: username || null,
      name: input.name?.trim() || null,
      password: passwordHash,
    },
    select: publicUserSelect,
  });

  return createSession(user, meta);
}

export async function loginUser(
  input: { identifier: string; password: string },
  meta: SessionMeta,
): Promise<AuthTokens> {
  const identifier = input.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: identifier.includes("@")
      ? { email: identifier }
      : { username: identifier },
    select: {
      ...publicUserSelect,
      password: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return createSession(user, meta);
}

export async function refreshAuthSession(
  rawRefreshToken: string | undefined | null,
  meta: SessionMeta,
): Promise<AuthTokens> {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const decoded = verifyRefreshToken(rawRefreshToken);
  if (decoded.type !== "refresh") {
    throw new AppError("Invalid refresh token", 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const session = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!session || !session.user.isActive) {
    throw new AppError("Refresh session is invalid or expired", 401);
  }

  await revokeRefreshToken(rawRefreshToken);
  return createSession(session.user, meta);
}

export async function logoutUser(rawRefreshToken?: string | null) {
  await revokeRefreshToken(rawRefreshToken);
}

export async function logoutAllUserSessions(userId: string) {
  await revokeAllRefreshTokens(userId);
}

export async function createPasswordReset(input: { email: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: publicUserSelect,
  });

  if (!user) {
    return {
      resetToken: null,
      message: "If the account exists, a reset token was generated.",
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  const resetToken = generateRandomToken(32);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(Date.now() + resetExpiryMs),
    },
  });

  return {
    resetToken,
    message: "If the account exists, a reset token was generated.",
  };
}

export async function resetPassword(input: {
  token: string;
  password: string;
}) {
  const tokenHash = hashToken(input.token);
  const resetRecord = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!resetRecord || !resetRecord.user.isActive) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  const password = await bcrypt.hash(input.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: resetRecord.userId },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { message: "Password has been reset successfully" };
}

export async function changePassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const matches = await bcrypt.compare(input.currentPassword, user.password);
  if (!matches) {
    throw new AppError("Current password is incorrect", 401);
  }

  const password = await bcrypt.hash(input.newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: input.userId },
      data: { password },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: input.userId },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { message: "Password updated successfully" };
}

export async function getCurrentAuthUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function disableOwnAccount(userId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    }),
    prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    }),
  ]);

  return { message: "Account deactivated" };
}
