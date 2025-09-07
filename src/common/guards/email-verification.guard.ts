import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtBaseGuard } from "./base/jwt.guard";

@Injectable()
export class EmailVerificationGuard extends JwtBaseGuard {
  constructor(
    jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    super(jwtService);
  }

  protected async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>("EMAIL_VERIFICATION_SECRET"),
    });
  }

  protected attachPayloadToRequest(request: Request, payload: any): void {
    request.emailVerified = payload;
  }

  protected getNoTokenError(): string {
    return "이메일 인증 토큰이 없습니다.";
  }

  protected getInvalidTokenError(): string {
    return "이메일 인증 토큰이 유효하지 않습니다.";
  }
}
