import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, filter, map, Observable, tap, toArray } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<string[]> {
    return next.handle().pipe(
      // 全部换成大写字母
      map((data: string) => data.toUpperCase()),
      // 过滤，只留下包含A的字母
      filter((data: string) => data.includes('A')),
      // 打印每一项
      tap((data) => console.log('auth after interceptor', data)),

      // 转换成数组
      toArray(),

      // 报错拦截
      catchError((err) => {
        console.log('---catchError---', err);
        throw new Error(err);
      }),
    );
  }
}
