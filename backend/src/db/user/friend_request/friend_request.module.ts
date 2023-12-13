import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { FriendRequestService } from './friend_request.service'
import { FriendRequest } from './friend_request.entity'
import { UserModule } from '../user.module'


@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),

    forwardRef(() => UserModule)
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