import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { FriendRequest } from './friend_request.entity';
import { PlayRequest } from './play_request.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConversationModule } from '..';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MatchService } from './match/match.service';
import { Match } from './match/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FriendRequest, PlayRequest, Match]),
    forwardRef(() => AuthModule),
    forwardRef(() => ConversationModule),
    forwardRef(() => NotificationsModule)
  ],
  exports: [TypeOrmModule, UserService, MatchService],
  providers: [UserService, MatchService],
  controllers: [UserController],
})
export class UserModule {}