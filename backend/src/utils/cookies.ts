import type { Response } from "express";
import config from "../config";
import { parseDurationToMs } from "./duration";

const baseCookieOptions = {
  httpOnly: true,
  path: "/",
  secure: config.isProduction,
  sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(config.cookieNames.access, accessToken, {
    ...baseCookieOptions,
    maxAge: parseDurationToMs(config.jwtAccessExpiresIn),
  });

  res.cookie(config.cookieNames.refresh, refreshToken, {
    ...baseCookieOptions,
    maxAge: parseDurationToMs(config.jwtRefreshExpiresIn),
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(config.cookieNames.access, { ...baseCookieOptions });
  res.clearCookie(config.cookieNames.refresh, { ...baseCookieOptions });
}
