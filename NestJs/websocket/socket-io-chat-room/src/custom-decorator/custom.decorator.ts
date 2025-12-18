import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

export const NoNeedToken = () => SetMetadata('NoNeedToken', true);

export const UserInfo = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return data ? request.user[data] : request.user;
  },
);
