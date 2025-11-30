import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AopService } from './aop.service';

@Injectable()
export class AopMiddleware implements NestMiddleware {
  @Inject()
  private readonly aopService: AopService;

  use(req: Request, res: Response, next: NextFunction) {
    console.log(`中间件before: ${req.url}`);
    console.log(`在中间件中使用Service方法：${this.aopService.findAll()}`);
    next();
    console.log(`中间件after: ${res.statusCode}`);
  }
}
