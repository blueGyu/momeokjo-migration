import { CookieOptions } from "express";
import env from "./env";

export const COOKIE_NAME = {
  REFRESH_TOKEN: "refreshToken",
  ACCESS_TOKEN: "accessToken",
  EMAIL_AUTH_SEND: "emailAuthSend",
  EMAIL_AUTH_VERIFIED: "emailAuthVerified",
  PASSWORD_RESET: "passwordReset",
  OAUTH_SIGN_UP: "oauthSignUp",
};

const COMMON_COOKIE_OPTION: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV !== "local",
  sameSite: env.NODE_ENV === "local" ? "lax" : "none",
};

const makeCookieOption = (term: "long" | "short"): CookieOptions => ({
  ...COMMON_COOKIE_OPTION,
  maxAge:
    1000 *
    60 *
    parseInt(term === "long" ? env.COOKIE_LONG_EXPIRES_IN : env.COOKIE_SHORT_EXPIRES_IN),
});

export const COOKIE_OPTIONS: Record<string, CookieOptions> = {
  [COOKIE_NAME.REFRESH_TOKEN]: makeCookieOption("long"),
  [COOKIE_NAME.ACCESS_TOKEN]: makeCookieOption("short"),
  [COOKIE_NAME.EMAIL_AUTH_SEND]: makeCookieOption("short"),
  [COOKIE_NAME.EMAIL_AUTH_VERIFIED]: makeCookieOption("short"),
  [COOKIE_NAME.PASSWORD_RESET]: makeCookieOption("short"),
  [COOKIE_NAME.OAUTH_SIGN_UP]: makeCookieOption("short"),
};
