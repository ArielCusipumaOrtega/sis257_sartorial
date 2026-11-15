import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startTime;
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', `${elapsed}ms`);
          res.setHeader('X-Powered-By', 'Sartorial Prestige Engine');
        }
        this.logger.log(
          `[${req.method}] ${req.originalUrl || req.url} - ${res.statusCode} (${elapsed}ms)`,
        );
      }),
    );
  }
}
