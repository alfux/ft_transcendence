import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PrivateConversation } from './private_conversation/private_conversation.entity'
import { PrivateConversationService } from './private_conversation/private_conversation.service'
import { PrivateConversationController } from './private_conversation/private_conversation.controller'

import { PrivateMessage } from './private_message/private_message.entity'
import { PrivateMessageService } from './private_message/private_message.service'

import { UserModule } from 'src/db/user'
import { NotificationsModule } from 'src/notifications/'
import { AuthModule } from 'src/auth'

@Module({
  imports: [
    TypeOrmModule.forFeature([PrivateConversation, PrivateMessage]),
    forwardRef(() => UserModule),
    NotificationsModule,

    forwardRef(() => UserModule),
    forwardRef(() => AuthModule)
  ],

  providers: [
    PrivateConversationService,
    PrivateMessageService
  ],

  controllers: [
    PrivateConversationController],

  exports: [
    TypeOrmModule,
    PrivateConversationService
  ],
})
export class PrivateConversationModule { }