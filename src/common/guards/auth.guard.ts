import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { JwtBaseGuard } from "./base/jwt.guard";

@Injectable()
export class AuthGuard extends JwtBaseGuard {
  protected async verifyToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token);
  }

  protected attachPayloadToRequest(request: Request, payload: any): void {
    request.authUser = payload;
  }

  protected getNoTokenError(): string {
    return "인증 토큰이 없습니다.";
  }

  protected getInvalidTokenError(): string {
    return "인증 토큰이 유효하지 않습니다.";
  }
}
