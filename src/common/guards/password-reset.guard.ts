import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { JwtBaseGuard } from "./base/jwt.guard";

@Injectable()
export class PasswordResetGuard extends JwtBaseGuard {
  constructor(
    jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    super(jwtService);
  }

  protected async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>("PASSWORD_RESET_SECRET"),
    });
  }

  protected attachPayloadToRequest(request: Request, payload: any): void {
    request.passwordReset = payload;
  }

  protected getNoTokenError(): string {
    return "비밀번호 초기화 인증 토큰이 없습니다.";
  }

  protected getInvalidTokenError(): string {
    return "비밀번호 초기화 인증 토큰이 유효하지 않습니다.";
  }
}
