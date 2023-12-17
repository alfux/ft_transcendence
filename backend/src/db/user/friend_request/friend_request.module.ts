import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FriendRequestService } from './friend_request.service'
import { FriendRequest } from './friend_request.entity'
import { NotificationsModule } from 'src/notifications'


@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),
    NotificationsModule
  ],

  providers: [
    FriendRequestService
  ],

  controllers: [
  ],

  exports: [
    TypeOrmModule,
    FriendRequestService,
  ],
})
export class FriendRequestModule { }