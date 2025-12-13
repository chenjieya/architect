import { Module } from '@nestjs/common';
import { LoginJwtService } from './login-jwt.service';
import { LoginJwtController } from './login-jwt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Login]),
    JwtModule.register({
      secret: 'alvis',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [LoginJwtController],
  providers: [LoginJwtService],
})
export class LoginJwtModule {}
