import { Module } from '@nestjs/common'

import { UserModule } from 'src/db/user'
import { GameGateway } from './game.gateway'
import { AuthModule } from 'src/auth/auth.module'
import { ConversationModule } from 'src/db/conversation'

@Module({
  imports: [
    UserModule,
    ConversationModule,
    AuthModule
  ],

  providers: [
    GameGateway
  ],

  controllers: []
})
export class GameModule { }