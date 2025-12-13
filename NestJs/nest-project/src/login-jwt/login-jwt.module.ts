import { forwardRef, Module } from '@nestjs/common';
import { LoginJwtService } from './login-jwt.service';
import { LoginJwtController } from './login-jwt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Login]),
    JwtModule.register({
      secret: 'alvis',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    forwardRef(() => AuthModule),
  ],
  controllers: [LoginJwtController],
  providers: [LoginJwtService],
  exports: [LoginJwtService],
})
export class LoginJwtModule {}
