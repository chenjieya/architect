import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { MyLogger } from './logger/myLogger';
import { Response, Request } from 'express';

@Catch(HttpException)
export class LoggerFilter<T> implements ExceptionFilter {
  @Inject(MyLogger)
  private logger: MyLogger;

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    console.log(exception.message, 'message');

    console.log(exceptionResponse, 'exceptionResponse');

    const logFormat = `
    ################################################
    Request original url: ${request.originalUrl}
    Method: ${request.method}
    IP: ${request.ip}
    Status code: ${status}
    Response: ${exception.toString() + `(${JSON.stringify(exceptionResponse)})`}
    `;
    this.logger.error(logFormat, 'HttpExceptionFilter');

    response.status(status).json({
      code: status,
      timestamp: new Date().toLocaleString(),
      error: exception?.message || exceptionResponse,
      msg: `${status >= 500 ? 'Server Error' : 'Client Error'}`,
    });
  }
}
