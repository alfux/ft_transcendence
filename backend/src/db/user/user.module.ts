import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { FriendRequest } from './friend_request.entity';
import { AuthModule } from 'src/auth';
import { ConversationModule } from '..';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, FriendRequest]),
    forwardRef(() => AuthModule),
    forwardRef(() => ConversationModule)
  ],
  exports: [TypeOrmModule, UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}