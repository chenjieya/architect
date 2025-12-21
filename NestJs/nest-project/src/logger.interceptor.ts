import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { MyLogger } from './logger/myLogger';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: MyLogger) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        const logFormat = `
        ################################################
        Request original url: ${req.originalUrl}
        Method: ${req.method}
        IP: ${req.ip}
        Response Data: ${JSON.stringify(data)}
        ################################################
        `;
        this.logger.log(logFormat, 'Response LoggerInterceptor');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return data;
      }),
    );
  }
}
