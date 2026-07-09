import type { Role } from "@prisma/client";

export type Capability =
  | "auth:read-own"
  | "auth:update-own"
  | "auth:change-password"
  | "auth:logout"
  | "user:read-any"
  | "user:manage"
  | "user:role-manage"
  | "user:delete-any"
  | "blog:review"
  | "blog:publish";

export const roleCapabilities: Record<Role, Capability[]> = {
  USER: [
    "auth:read-own",
    "auth:update-own",
    "auth:change-password",
    "auth:logout",
  ],
  MODERATOR: [
    "auth:read-own",
    "auth:update-own",
    "auth:change-password",
    "auth:logout",
    "user:read-any",
    "blog:review",
  ],
  ADMIN: [
    "auth:read-own",
    "auth:update-own",
    "auth:change-password",
    "auth:logout",
    "user:read-any",
    "user:manage",
    "user:role-manage",
    "user:delete-any",
    "blog:review",
    "blog:publish",
  ],
};

export function hasCapability(role: Role, capability: Capability) {
  return roleCapabilities[role].includes(capability);
}
