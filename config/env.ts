import { config } from "dotenv";
config({
  path: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
});

import { z } from "zod";

const _env = z.object({
  NODE_ENV: z.string().default("local"),
  PORT: z.string().default("8000"),

  // AWS S3
  AWS_ACCESS_KEY: z.string(),
  AWS_SECRET_KEY: z.string(),
  AWS_REGION: z.string(),
  AWS_BUCKET_NAME: z.string(),

  // JWT
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  // NODEMAIL
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),

  // OAUTH
  KAKAO_REST_API_KEY: z.string(),
  KAKAO_REDIRECT_URI: z.string(),

  // ALGORITHM
  ALGORITHM_SECRET: z.string(),
  ALGORITHM_WAY: z.string(),
  ALGORITHM_IV_LENGTH: z.string(),

  // COOKIE
  FRONT_URL: z.string(),
  COOKIE_SHORT_EXPIRES_IN: z.string().default("15"),
  COOKIE_LONG_EXPIRES_IN: z.string().default("30"),

  // DATABASE
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.string().default("5432"),
});

const parsed = _env.safeParse(process.env);
if (!parsed.success) {
  throw new Error("환경변수 검증 실패: " + JSON.stringify(parsed.error.format()));
}

const env = parsed.data;
export default env;
