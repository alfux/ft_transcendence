import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FriendRequestService } from './friend_request.service'
import { FriendRequest } from './friend_request.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),
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