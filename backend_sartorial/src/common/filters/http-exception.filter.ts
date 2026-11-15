import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno en el servidor';
    let error = 'Internal Server Error';
    let validationErrors: string[] | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        error = resObj.error || exception.name;

        if (Array.isArray(resObj.message)) {
          validationErrors = resObj.message;
          message = resObj.message.join('; ');
        } else {
          message = resObj.message || exception.message;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      // Manejo específico de errores de base de datos PostgreSQL
      const pgError = exception as any;
      const code = pgError.code;

      switch (code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          error = 'Conflict';
          message =
            'Violación de unicidad: Ya existe un registro con estos datos clave (código SKU, CI/NIT o correo duplicado).';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.BAD_REQUEST;
          error = 'Foreign Key Violation';
          message =
            'No se puede completar la operación debido a que el registro está relacionado con otras entidades activas.';
          break;
        case '22P02': // invalid_text_representation
          status = HttpStatus.BAD_REQUEST;
          error = 'Bad Request';
          message = 'Formato de parámetro o identificador no válido para la base de datos.';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          error = 'Database Error';
          message = pgError.detail || pgError.message || 'Error en la consulta a la base de datos.';
      }
    } else if ((exception as any)?.name === 'MulterError') {
      const multerError = exception as any;
      status = HttpStatus.BAD_REQUEST;
      error = 'File Upload Error';

      switch (multerError.code) {
        case 'LIMIT_FILE_SIZE':
          message = 'El archivo supera el tamaño máximo permitido de 2 MB.';
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          message =
            'Campo de archivo inesperado. El formulario debe enviar el archivo bajo el campo "file".';
          break;
        default:
          message = multerError.message || 'Error al procesar la subida del archivo.';
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Error inesperado';
      this.logger.error(`Error no controlado: ${exception.message}`, exception.stack);
    }

    const errorPayload = {
      success: false,
      statusCode: status,
      error,
      message,
      ...(validationErrors ? { errors: validationErrors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    this.logger.warn(
      `[${request.method}] ${request.url} - Status ${status} - Error: ${JSON.stringify(message)}`,
    );

    response.status(status).json(errorPayload);
  }
}
