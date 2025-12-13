import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginJwtModule } from 'src/login-jwt/login-jwt.module';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    forwardRef(() => LoginJwtModule),
    JwtModule.register({
      secret: 'alvis',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
