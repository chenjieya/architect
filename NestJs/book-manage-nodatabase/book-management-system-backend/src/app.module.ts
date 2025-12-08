import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { APP_PIPE } from '@nestjs/core';
import { CustomValidationPipe } from './pipes/custom-pipe-validator.pipe';
import { DbModule } from './db/db.module';
import { BookModule } from './book/book.module';

@Module({
  imports: [UserModule, DbModule, BookModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule {}
