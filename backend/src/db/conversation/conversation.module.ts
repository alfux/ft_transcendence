import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { Conversation } from './conversation.entity';
import { UserModule } from '../user/user.module';
import { MessageModule } from '../message';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    UserModule,
    MessageModule
  ],
  exports: [TypeOrmModule, ConversationService],
  providers: [ConversationService],
  controllers: [ConversationController],
})
export class ConversationModule {}