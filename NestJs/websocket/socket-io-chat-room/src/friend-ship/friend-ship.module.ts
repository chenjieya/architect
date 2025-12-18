import { Module } from '@nestjs/common';
import { FriendShipService } from './friend-ship.service';
import { FriendShipController } from './friend-ship.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from 'src/entities/friend-request.entity';
import { FriendShip } from 'src/entities/friend-ship.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, FriendShip, User])],
  controllers: [FriendShipController],
  providers: [FriendShipService],
})
export class FriendShipModule {}
