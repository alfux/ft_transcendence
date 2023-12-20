// src/chat/chat.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { ConversationService } from 'src/db/conversation'

import { CoolSocket, getCoolClients, Client } from 'src/socket'
import { PrivateMessage, PrivateMessageService } from 'src/db/private_conversation/private_message'
import { PrivateConversationService } from './private_conversation.service'
import { HttpUnauthorized } from 'src/exceptions'
import { AuthService } from 'src/auth'
import { UserService } from 'src/db/user'
import { Inject, forwardRef } from '@nestjs/common'

@WebSocketGateway({ namespace: 'private_chat' })
export class PrivateConversationGateway implements OnGatewayConnection {

  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService, //NE PAS ENELEVER
    @Inject(forwardRef(() => UserService))
    private userService: UserService, //NE PAS ENELEVER

    private messageService: PrivateMessageService,
    private conversationService: PrivateConversationService
  ) { }

  @WebSocketServer() server: Server

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
  }

  @SubscribeMessage('auth')
  @CoolSocket()
  async handleAuth() {}

  @SubscribeMessage('send_message')
  @CoolSocket()
  async handleMessage(client: Client, data: { message: string, conversation_id: number }): Promise<void> {
    const conv = await this.conversationService.getPrivateConversation({ id: data.conversation_id }, ['users', 'users.user'])

    const user = conv.users.find((v) => v.id === client.user.id)
    if (!user)
      throw new HttpUnauthorized("You are not in the conversation")

    const new_message = new PrivateMessage()
    new_message.content = data.message
    new_message.conversation = conv
    new_message.sender = user
    await this.messageService.createPrivateMessage(new_message)

    getCoolClients().forEach((value) => {
      if (conv.users.find((v) => v.id === value.user.id)) {
        value.socket.emit('receive_message',
          {
            username: client.user.username,
            conversation_id: data.conversation_id,
            message: data.message
          })
      }
    })
  }
}
