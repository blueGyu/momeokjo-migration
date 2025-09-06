import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // NestJS가 던지는 에러 메시지가 객체일 수도, 문자열일 수도 있어 분기 처리
    const message =
      typeof errorResponse === "string"
        ? errorResponse
        : (errorResponse as any).message;

    // TODO: 로깅 로직 추가하기

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
