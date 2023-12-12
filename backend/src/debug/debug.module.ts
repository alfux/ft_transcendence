import { Module } from '@nestjs/common'

import { AuthModule } from 'src/auth'
import { UserModule } from 'src/db/user'
import { DebugController } from './debug.controller'
import { ConversationModule } from 'src/db/conversation'

@Module({
  imports: [
    UserModule, ConversationModule, AuthModule
  ],
  controllers: [DebugController],
})
export class DebugModule { }