import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export abstract class JwtBaseGuard implements CanActivate {
  constructor(protected readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(this.getNoTokenError());
    }

    try {
      const payload = await this.verifyToken(token);
      this.attachPayloadToRequest(request, payload);
      return true;
    } catch (error) {
      throw new UnauthorizedException(this.getInvalidTokenError());
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  protected abstract verifyToken(token: string): Promise<any>;
  protected abstract attachPayloadToRequest(request: Request, payload: any): void;
  protected abstract getNoTokenError(): string;
  protected abstract getInvalidTokenError(): string;
}