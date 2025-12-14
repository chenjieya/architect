import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class NoNeedPermissionGuard extends AuthGuard('jwt') {
  @Inject(Reflector)
  private readonly reflector: Reflector;

  constructor() {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'NoNeedPermission',
      [context.getClass(), context.getHandler()],
    );
    console.log(isPublic, 'isPublic');

    // 说明接口是不需要权限的
    if (isPublic) {
      return true;
    }

    // 否则走jwt验证流程
    return super.canActivate(context);
  }
}
