import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'

import { Conversation, ConversationUser, ConversationUserInfos, ConversationModule } from 'src/db/conversation'
import { Message } from 'src/db/conversation/message'

import { User, FriendRequest, PlayRequest, Match, UserModule } from 'src/db/user'

import { AuthModule } from 'src/auth/auth.module'

import { NotificationsModule } from 'src/notifications/'

import { DebugModule } from 'src/debug/debug.module'

import { GameModule } from 'src/game/game.module'

import { config_db } from 'src/config'
import { PrivateConversation, PrivateConversationModule, PrivateMessage } from './db/private_conversation'

@Module({
	imports: [
		ScheduleModule.forRoot(),
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: config_db.host,
			port: +config_db.port,
			username: config_db.user,
			password: config_db.password,
			database: config_db.database,
			entities: [
				User,
				
				Conversation,
				ConversationUser,
				ConversationUserInfos,
				Message,
				
				PrivateConversation,
				PrivateMessage,

				FriendRequest,
				PlayRequest,

				Match
			],
			synchronize: true,
		}),
		UserModule,
		ConversationModule,
		PrivateConversationModule,
		AuthModule,
		GameModule,
		NotificationsModule,
	],
})
export class AppModule { }