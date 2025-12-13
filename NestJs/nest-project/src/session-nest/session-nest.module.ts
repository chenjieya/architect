import { Module } from '@nestjs/common';
import { SessionNestService } from './session-nest.service';
import { SessionNestController } from './session-nest.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
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
  ],
  controllers: [SessionNestController],
  providers: [SessionNestService],
})
export class SessionNestModule {}
