import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from './user.entity'
import { UserService } from './user.service'
import { UserController } from './user.controller'

import { FriendRequest, FriendRequestService } from './friend_request'
import { PlayRequest, PlayRequestService } from './play_request'
import { Match, MatchService } from './match'

import { AuthModule } from 'src/auth/auth.module'

import { ConversationModule } from 'src/db/conversation'
import { NotificationsModule } from 'src/notifications/'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FriendRequest, PlayRequest, Match]),
    forwardRef(() => AuthModule),
    forwardRef(() => ConversationModule),
    forwardRef(() => NotificationsModule)
  ],

  providers: [
    UserService,

    FriendRequestService,
    PlayRequestService,
    MatchService,
  ],

  controllers: [
    UserController
  ],

  exports: [
    TypeOrmModule,

    UserService,

    FriendRequestService,
    PlayRequestService,
    MatchService,
  ],
})
export class UserModule { }