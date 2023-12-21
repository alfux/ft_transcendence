import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ConversationUser, ConversationUserInfos } from 'src/db/conversation/conversation_user'
import { Conversation, ConversationService } from 'src/db/conversation'
import { ConversationController } from 'src/db/conversation/conversation/conversation.controller'
import { ConversationGateway } from 'src/db/conversation/conversation/conversation.gateway'

import { Message, MessageService } from 'src/db/conversation/message'

import { UserModule } from 'src/db/user'
import { NotificationsModule } from 'src/notifications'
import { AuthModule } from 'src/auth'


@Module({
	imports: [
		TypeOrmModule.forFeature([
			Conversation,
			ConversationUser,
			ConversationUserInfos,

			Message
		]),
		forwardRef(() => UserModule),
		AuthModule,
		NotificationsModule,
	],

	providers: [
		ConversationService,
		ConversationGateway,
		MessageService
	],

	controllers: [ConversationController],

	exports: [
		TypeOrmModule,
		ConversationService,
		MessageService
	],
})
export class ConversationModule { }