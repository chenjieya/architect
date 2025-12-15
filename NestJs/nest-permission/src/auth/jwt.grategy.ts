import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';

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

  validate(payload?: Omit<User, 'password'>) {
    console.log(payload, 'payload');
    return {
      id: payload?.id,
      username: payload?.username,
      roles: payload?.roles,
    };
  }
}
