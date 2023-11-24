import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'

import { User, UserModule } from './db/user'
import { Message, MessageModule } from './db/message'
import { Conversation, ConversationUser, ConversationUserInfos, ConversationModule } from './db/conversation'

import { ChatModule } from './chat/chat.module'
import { AuthModule, JwtAuthGuard } from './auth'
import { config_db } from './config'
import { DebugModule } from './debug/debug.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: config_db.host,
      port: +config_db.port,
      username: config_db.user,
      password: config_db.password,
      database: config_db.database,
      entities: [User, Message, Conversation, ConversationUser, ConversationUserInfos],
      synchronize: true,
    }),
    UserModule,
    MessageModule,
    ConversationModule,
    ChatModule,
    AuthModule,
    DebugModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ]
})
export class AppModule {}