import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PrivateConversation, PrivateConversationService } from 'src/db/private_conversation'
import { PrivateConversationController } from 'src/db/private_conversation/private_conversation/private_conversation.controller'
import { PrivateConversationGateway } from 'src/db/private_conversation/private_conversation/private_conversation.gateway'

import { PrivateMessage, PrivateMessageService } from 'src/db/private_conversation/private_message'

import { UserModule } from 'src/db/user'
import { NotificationsModule } from 'src/notifications'
import { AuthModule } from 'src/auth'

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PrivateConversation,

			PrivateMessage
		]),
		forwardRef(() => UserModule),
		AuthModule,
		NotificationsModule,
	],

	providers: [
		PrivateConversationService,
		PrivateConversationGateway,
		PrivateMessageService
	],

	controllers: [
		PrivateConversationController
	],

	exports: [
		TypeOrmModule,
		PrivateConversationService,
	],
})
export class PrivateConversationModule { }