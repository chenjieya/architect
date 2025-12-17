import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { Injectable } from '@nestjs/common';

export type User = Pick<Request, 'user'>['user'];

@Injectable()
export class LocalGratety extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<User> {
    const user = await this.authService.validateLocal(username, password);
    return {
      username: user.username,
      email: user.email,
      id: user.id,
    };
  }
}
