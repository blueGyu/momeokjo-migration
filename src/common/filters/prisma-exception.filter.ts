import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "데이터베이스 처리 중 내부 서버 오류가 발생했습니다.";

    // TODO: 도메인 리펙토링을 진행하며 케이스 추가하기
    // 현재 임시 코드로 작성되었음. 추후 삭제 예정
    switch (exception.code) {
      case "P2002":
        status = HttpStatus.CONFLICT;
        message = `이미 존재하는 값입니다. (중복된 필드: ${exception.meta?.target})`;
        break;
      case "P2025":
        status = HttpStatus.NOT_FOUND;
        message = "요청한 리소스를 찾을 수 없습니다.";
        break;
      default:
        break;
    }

    // TODO: 로깅 로직 추가하기

    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
