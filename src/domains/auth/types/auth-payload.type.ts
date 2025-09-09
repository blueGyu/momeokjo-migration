import { Role } from "@prisma/client";

export type UserPayload = {
  userIdx: number;
  role: Role;
};

export type EmailVerifiedPayload = {
  email: string;
};

export type PasswordResetPayload = {
  id: string;
  email: string;
};
