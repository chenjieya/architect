import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class MyAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isWhite = this.reflector.getAllAndOverride<boolean>('NoNeedToken', [
      context.getClass(),
      context.getHandler(),
    ]);

    // 白名单
    if (isWhite) {
      return true;
    }

    // 否则走jwt验证流程
    return super.canActivate(context);
  }
}
