import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from './user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'

import { AuthModule } from 'src/auth/auth.module'

import { ConversationModule } from 'src/db/conversation'
import { NotificationsModule } from 'src/notifications/'
import { FriendRequestModule } from './friend_request/friend_request.module'
import { PlayRequestModule } from './play_request/play_request.module'
import { MatchModule } from './match/match.module'
import { UserFriendRequestController } from './user.friend_request.controller'
import { UserPlayRequestController } from './user.play_request.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    forwardRef(() => AuthModule),
    forwardRef(() => ConversationModule),
    forwardRef(() => NotificationsModule),

    MatchModule,
    FriendRequestModule,
    PlayRequestModule,
  ],

  providers: [
    UserService,
  ],

  controllers: [
    UserController,
    UserFriendRequestController,
    UserPlayRequestController
  ],

  exports: [
    TypeOrmModule,

    UserService,
  ],
})
export class UserModule { }