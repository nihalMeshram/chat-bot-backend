import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

/**
 * A global exception filter that catches all unhandled exceptions in the application.
 * It transforms them into user-friendly HTTP responses and logs detailed error messages.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Logger instance for logging error details
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * This method handles any exception that occurs during a request.
   * It logs the error and formats the response with a consistent structure.
   *
   * @param exception - The caught exception, can be any type
   * @param host - The execution context containing HTTP request and response
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // Extract Fastify response and request from context
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<Request>();

    // Default values for unexpected errors
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorType = 'InternalServerError';

    // Handle known HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      // If response is an object, extract its fields
      if (typeof res === 'object' && res !== null) {
        const { message: msg, error } = res as Record<string, any>;
        message = msg || message;
        errorType = error || errorType;
      } else {
        // If response is a string, use it as the message
        message = res as string;
      }
    }
    // Handle standard JavaScript errors
    else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    // Log the error details with HTTP method and URL
    this.logger.error(`[${request.method}] ${request.url} - ${errorType}: ${message}`);

    // Send a consistent error response to the client
    response.status(status).send({
      statusCode: status,
      message,
      error: errorType,
    });
  }
}
