import { Module, forwardRef } from '@nestjs/common'

import { UserModule } from 'src/db/user'
import { GameGateway } from './game.gateway'
import { AuthModule } from 'src/auth/auth.module'
import { ConversationModule } from 'src/db/conversation'
import { MatchModule } from 'src/db/user/match/match.module'
import { NotificationsModule } from 'src/notifications'

@Module({
	imports: [
		ConversationModule,
		forwardRef(() => UserModule),
		AuthModule,
		MatchModule,
		NotificationsModule
	],

	providers: [
		GameGateway
	],

	controllers: []
})
export class GameModule { }