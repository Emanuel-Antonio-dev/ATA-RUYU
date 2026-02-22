import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: any = {
      message: 'Ocorreu um erro interno no servidor',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        responseBody = { message: exceptionResponse };
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        responseBody = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      responseBody = { message: exception.message };
    }
    delete responseBody['error'];
    response.status(status).json({
      statusCode: status,
      success: false,
      timestamp: new Date().toLocaleString(),
      ...responseBody,
    });
  }
}
