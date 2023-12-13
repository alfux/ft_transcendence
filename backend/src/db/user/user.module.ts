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
import { FriendRequestModule } from './friend_request/friend_request.module'
import { PlayRequestModule } from './play_request/play_request.module'
import { MatchModule } from './match/match.module'

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
    UserController
  ],

  exports: [
    TypeOrmModule,

    UserService,
  ],
})
export class UserModule { }