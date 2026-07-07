import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MulterError } from 'multer';

const MULTER_ERROR_MESSAGES_FA: Partial<Record<string, string>> = {
  LIMIT_FILE_SIZE: 'حجم فایل ارسالی بیش از حد مجاز است.',
  LIMIT_FILE_COUNT: 'تعداد فایل‌های ارسالی بیش از حد مجاز است.',
  LIMIT_UNEXPECTED_FILE: 'فیلد فایل ارسالی نامعتبر است.',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.resolveStatusCode(exception);
    const message = this.extractMessage(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json({
      success: false,
      message,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    if (exception instanceof MulterError) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (typeof response === 'object' && response !== null && 'message' in response) {
        return (response as { message: string | string[] }).message;
      }
      return exception.message;
    }
    if (exception instanceof MulterError) {
      return MULTER_ERROR_MESSAGES_FA[exception.code] ?? 'خطا در آپلود فایل.';
    }
    return 'خطای داخلی سرور رخ داده است.';
  }
}
