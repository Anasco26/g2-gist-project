import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../config";
import type { JwtUserPayload } from "../types/auth";

function signToken(
  payload: Omit<JwtUserPayload, "type">,
  type: JwtUserPayload["type"],
  secret: string,
  expiresIn: string,
) {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign({ ...payload, type }, secret, options);
}

export function createAccessToken(payload: Omit<JwtUserPayload, "type">) {
  return signToken(
    payload,
    "access",
    config.jwtAccessSecret,
    config.jwtAccessExpiresIn,
  );
}

export function createRefreshToken(payload: Omit<JwtUserPayload, "type">) {
  return signToken(
    payload,
    "refresh",
    config.jwtRefreshSecret,
    config.jwtRefreshExpiresIn,
  );
}

export function createPasswordResetToken(
  payload: Omit<JwtUserPayload, "type">,
) {
  return signToken(
    payload,
    "reset",
    config.jwtResetSecret,
    config.jwtResetExpiresIn,
  );
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtAccessSecret) as JwtUserPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtUserPayload;
}

export function verifyPasswordResetToken(token: string) {
  return jwt.verify(token, config.jwtResetSecret) as JwtUserPayload;
}

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
