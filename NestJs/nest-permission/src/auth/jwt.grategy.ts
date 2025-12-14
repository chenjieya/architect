import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class JwtGrategy extends PassportStrategy(Strategy) {
  // @Inject(ConfigService)
  // private readonly config: ConfigService;
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET')!,
    });
  }

  validate(payload: { userId: number; username: string; roles: Role[] }) {
    return {
      userId: payload.userId,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
