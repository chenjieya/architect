import {
  applyDecorators,
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomGuard } from './custom.guard';

// 方法装饰器
export const SetUser = (...args: string[]) => SetMetadata('SetUser', args);

// 参数装饰器
export const MyHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    return request.headers[data];
  },
);

export const MyQuery = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.query[data];
  },
);

export const MyParams = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.params[data];
  },
);

// 合并装饰器
export const MyCombinedDecorator = function (path: string, ...users: string[]) {
  return applyDecorators(Get(path), SetUser(...users), UseGuards(CustomGuard));
};

// 类装饰器
export const MyController = function (path: string, ...args: string[]) {
  return applyDecorators(Controller(path), SetMetadata('MyClass', args));
};
