import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PersonModule } from './person/person.module';
import { DepartModule } from './depart/depart.module';

@Module({
  imports: [UserModule, PersonModule, DepartModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
