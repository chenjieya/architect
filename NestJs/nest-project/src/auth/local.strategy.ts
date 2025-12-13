import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService)
  private readonly authService: AuthService;

  constructor() {
    super();
  }

  async validate(username: string, password: string) {
    const res = await this.authService.validator(username, password);
    // console.log(res);
    return res;
  }
}
