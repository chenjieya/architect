import { forwardRef, Module } from '@nestjs/common';
import { LoginJwtService } from './login-jwt.service';
import { LoginJwtController } from './login-jwt.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Login]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '7d',
          },
        };
      },
    }),
    // JwtModule.register({
    //   secret: 'alvis',
    //   signOptions: {
    //     expiresIn: '7d',
    //   },
    // }),
    forwardRef(() => AuthModule),
  ],
  controllers: [LoginJwtController],
  providers: [LoginJwtService],
  exports: [LoginJwtService],
})
export class LoginJwtModule {}
