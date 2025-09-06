import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AuthGuard } from "./guards/auth.guard";
import { PasswordResetGuard } from "./guards/password-reset.guard";
import { EmailVerificationGuard } from "./guards/email-verification.guard";
import { CryptoService } from "./utils/crypto.util";
import { EmailService } from "./utils/email.service";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { PrismaExceptionFilter } from "./filters/prisma-exception.filter";

@Module({
  providers: [
    AuthGuard,
    EmailVerificationGuard,
    PasswordResetGuard,
    CryptoService,
    EmailService,
    HttpExceptionFilter,
    PrismaExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  exports: [
    AuthGuard,
    EmailVerificationGuard,
    PasswordResetGuard,
    CryptoService,
    EmailService,
  ],
})
export class CommonModule {}
