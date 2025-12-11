import {
  Controller,
  Get,
  Headers,
  Inject,
  Req,
  Res,
  Session,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionNestService } from './session-nest.service';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('session-nest')
export class SessionNestController {
  constructor(private readonly sessionNestService: SessionNestService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  private readonly tokenContent = { count: 1 };

  @Get('jwt1')
  // passthrough 让Response不用通过send方式进行响应
  jwt1(@Res({ passthrough: true }) response: Response) {
    const token = this.jwtService.sign(this.tokenContent);

    response.setHeader('Authorization', `Bearer ${token}`);

    return 'jwt1';
  }

  @Get('jwt2')
  // passthrough 让Response不用通过send方式进行响应
  jwt2(
    @Headers('Authorization') authorization: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log(authorization, 'authorization');

    if (authorization) {
      try {
        const token = authorization.split(' ')[1];
        // 校验token是否正确
        const payload = this.jwtService.verify(token);

        // 生成一个新的token
        const newToken = this.jwtService.sign({ count: payload.count + 1 });
        response.setHeader('Authorization', `Bearer ${newToken}`);
      } catch (err) {
        console.log(err);
        throw new UnauthorizedException('授权失败');
      }
    } else {
      throw new UnauthorizedException('授权失败');
    }

    return 'jwt2';
  }

  @Get('session1')
  session1(@Session() session: Record<string, any>) {
    console.log(session, 'session');
    session.count = session.count ? session.count + 1 : 1;
    return session.count;
  }

  @Get('session2')
  session2(@Req() request: Request) {
    const session = request.session;
    console.log(request.sessionID);

    session.count = session.count ? session.count + 1 : 1;
    return session;
  }
}
