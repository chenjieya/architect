import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AopService } from './aop.service';

// 守卫需要通过 装饰器 来进行调用

@Injectable()
export class AopGuard implements CanActivate {
  @Inject(AopService)
  private readonly aopService: AopService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log(
      `--------------------守卫中的方法执行了${this.aopService.findAll()}---------------------`,
    );
    // 必须返回true才能继续通行，否则请求会被拒绝
    return true;
  }
}
