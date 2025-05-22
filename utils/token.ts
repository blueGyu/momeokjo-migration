import env from "../config/env";
import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";

type generateTokenResult = {
  success: boolean;
  data: string | null;
  message: string;
};

type verifyTokenResult = {
  success: boolean;
  data: JwtPayload | string | null;
  code?: "TOKEN_EXPIRED" | "INVALID_TOKEN" | "UNKNOWN_ERROR";
  message: string;
};

export const generateAccessToken = (payload: Record<string, unknown>) => {
  return generateToken(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
};

export const generateRefreshToken = (payload: Record<string, unknown>) => {
  return generateToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
};

export const verifyAccessToken = (token: string) => {
  return verifyToken(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return verifyToken(token, env.JWT_REFRESH_SECRET);
};

const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): generateTokenResult => {
  try {
    if (!payload || Object.keys(payload).length === 0)
      return { success: false, data: null, message: "payload 확인 필요" };

    const token = sign(payload, secret, { expiresIn } as SignOptions);

    return { success: true, data: token, message: "" };
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("secretOrPrivateKey"))
        return { success: false, data: null, message: "비밀키 확인 필요" };

      return { success: false, data: null, message: err.message };
    }

    return { success: false, data: null, message: "토큰 생성 중 오류 발생" };
  }
};

const verifyToken = (token: string, secret: Secret): verifyTokenResult => {
  try {
    if (!token) return { success: false, data: null, message: "token 확인 필요" };

    const decoded = verify(token, secret);

    return { success: true, data: decoded, message: "" };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "TokenExpiredError") {
        return {
          success: false,
          data: null,
          code: "TOKEN_EXPIRED",
          message: "토큰이 만료되었습니다.",
        };
      } else if (err.name === "JsonWebTokenError") {
        return {
          success: false,
          data: null,
          code: "INVALID_TOKEN",
          message: "유효하지 않은 토큰입니다.",
        };
      } else {
        return { success: false, data: null, code: "UNKNOWN_ERROR", message: err.message };
      }
    }

    return {
      success: false,
      data: null,
      code: "UNKNOWN_ERROR",
      message: "토큰 디코딩 중 오류 발생",
    };
  }
};
