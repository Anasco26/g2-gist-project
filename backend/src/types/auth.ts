import type { Role } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
}

export interface JwtUserPayload {
  sub: string;
  email: string;
  username: string;
  role: Role;
  type: "access" | "refresh" | "reset";
}

export interface SessionUser {
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
}
