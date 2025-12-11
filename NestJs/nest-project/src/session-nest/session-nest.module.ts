import { Module } from '@nestjs/common';
import { SessionNestService } from './session-nest.service';
import { SessionNestController } from './session-nest.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'alvis',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [SessionNestController],
  providers: [SessionNestService],
})
export class SessionNestModule {}
