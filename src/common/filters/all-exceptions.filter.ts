import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const { message: msg, error } = res as Record<string, any>;
        message = msg || message;
        errorType = error || errorType;
      } else {
        message = res as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    this.logger.error(`[${request.method}] ${request.url} - ${errorType}: ${message}`);

    response.status(status).send({
      statusCode: status,
      message,
      error: errorType,
    });
  }
}
