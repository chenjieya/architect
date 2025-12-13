import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'alvis',
    });
  }

  validate(payload: { userId: number; username: string }) {
    // payload 是从jwt 解析出来的数据。
    return { userId: payload.userId, username: payload.username };
  }
}
