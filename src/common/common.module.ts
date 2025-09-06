import { Module } from "@nestjs/common";
import { AuthGuard } from "./guards/auth.guard";
import { PasswordResetGuard } from "./guards/password-reset.guard";
import { EmailVerificationGuard } from "./guards/email-verification.guard";
import { CryptoService } from "./utils/crypto.util";

@Module({
  providers: [
    AuthGuard,
    EmailVerificationGuard,
    PasswordResetGuard,
    CryptoService,
  ],
  exports: [
    AuthGuard,
    EmailVerificationGuard,
    PasswordResetGuard,
    CryptoService,
  ],
})
export class CommonModule {}
