import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`全局中间件before:${req.url}`);
    next();
    console.log(`全局中间件after:${res.statusCode}`);
  }
}
