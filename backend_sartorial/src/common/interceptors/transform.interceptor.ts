import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, StandardApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardApiResponse<T> | T> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // Ignorar buffers binarios (ej. PDFs, planillas Excel) o respuestas vacías
        if (Buffer.isBuffer(data) || !data || data instanceof Uint8Array) {
          return data;
        }

        // Si ya contiene estructura de respuesta o paginación estándar, mantener compatibilidad
        if (typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          statusCode: res.statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
