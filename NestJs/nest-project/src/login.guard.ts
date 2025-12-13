import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
  };
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwt: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 校验token是否符合jwt规则
    const httpRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const header = httpRequest.header('Authorization') || '';

    const bearer = header.split(' ');

    if (!bearer || bearer.length < 2) {
      throw new UnauthorizedException('登录失效，请重新登录');
    }

    const token = bearer[1];
    console.log(token, 'token');

    try {
      const info: { user: { id: number; username: string } } =
        this.jwt.verify(token);
      httpRequest.user = info.user;

      return true;
    } catch (err) {
      console.log('守卫：', err);
      throw new UnauthorizedException('登录失效，请重新登录');
    }
  }
}
