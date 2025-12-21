import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';
import { MyLogger } from './logger/myLogger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: MyLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    // console.log(`全局中间件before:${req.url}`);
    const statusCode = res.statusCode;
    const logFormat = `
    ################################################
    Request original url: ${req.originalUrl}
    Method: ${req.method}
    IP: ${req.ip}
    Status code: ${statusCode}
    Params: ${JSON.stringify(req.params)}
    Query: ${JSON.stringify(req.query)}
    Body: ${JSON.stringify(req.body)}
    ################################################
    `;
    next();
    // console.log(`全局中间件after:${res.statusCode}`);
    if (statusCode >= 500) {
      this.logger.error(logFormat, 'Request LoggerMiddleware');
    } else if (statusCode >= 400) {
      this.logger.warn(logFormat, 'Request LoggerMiddleware');
    } else {
      this.logger.log(logFormat, 'Request LoggerMiddleware');
    }
  }
}
