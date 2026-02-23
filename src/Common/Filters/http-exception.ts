import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MulterError } from 'multer';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status      = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: Record<string, any> = {
      message: 'Ocorreu um erro interno no servidor',
    };

    // 1º — HttpException (NotFoundException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        responseBody = { message: exceptionResponse };
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        responseBody = exceptionResponse as Record<string, any>;
      }

    // 2º — MulterError
    } else if (exception instanceof MulterError) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      const multerMessages: Record<string, string> = {
        LIMIT_FILE_SIZE:       'O ficheiro excede o tamanho máximo permitido.',
        LIMIT_FILE_COUNT:      'Número de ficheiros excedido.',
        LIMIT_FIELD_KEY:       'Nome do campo demasiado longo.',
        LIMIT_FIELD_VALUE:     'Valor do campo demasiado longo.',
        LIMIT_FIELD_COUNT:     'Demasiados campos no formulário.',
        LIMIT_UNEXPECTED_FILE: 'Campo de ficheiro inesperado.',
        LIMIT_PART_COUNT:      'Demasiadas partes no formulário.',
      };

      responseBody = {
        message: multerMessages[exception.code] ?? exception.message,
      };

    // 3º — Erros do fileFilter / destination (JSON estruturado)
    } else if (exception instanceof Error) {
      try {
        const parsed = JSON.parse(exception.message);

        if (parsed?.statusCode && parsed?.message) {
          status       = parsed.statusCode;
          responseBody = { message: parsed.message };
        } else {
          responseBody = { message: exception.message };
        }
      } catch {
        responseBody = { message: exception.message };
      }
    }

    delete responseBody['error'];

    response.status(status).json({
      statusCode: status,
      success:    false,
      timestamp:  new Date().toLocaleString(),
      ...responseBody,
    });
  }
}