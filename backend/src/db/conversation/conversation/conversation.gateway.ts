import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { User, UserService } from 'src/db/user'
import { Client, CoolSocket, getCoolClients } from 'src/socket/'
import { ConversationService } from 'src/db/conversation'

import { Message, MessageService } from 'src/db/conversation/message'
import { HttpUnauthorized } from 'src/exceptions'
import { AuthService } from 'src/auth'
import { Inject, forwardRef } from '@nestjs/common'
import { CONVERSATION_DEFAULT } from './conversation.service'

@WebSocketGateway({ namespace: 'chat' })
export class ConversationGateway implements OnGatewayConnection {

  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService, //NE PAS ENELEVER
    @Inject(forwardRef(() => UserService))
    private userService: UserService, //NE PAS ENELEVER

    private messageService: MessageService,
    private conversationService: ConversationService
  ) { }

  @WebSocketServer() server: Server

  connectedClients: Socket[] = []

  async handleConnection(client: Socket) {
    this.connectedClients.push(client)
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.connectedClients = this.connectedClients.filter((c) => c.id !== client.id)
  }

  @SubscribeMessage('auth')
  @CoolSocket()
  async handleAuth() {}

  @SubscribeMessage('send_message')
  @CoolSocket()
  async handleMessage(client: Client, data: { message: string, conversation_id: number }): Promise<void> {
    const conv = await this.conversationService.getConversation({ id: data.conversation_id }, [...CONVERSATION_DEFAULT])
    const user = conv.users.find((v) => v.user.id === client.user.id)

    const mutedUntil = new Date(user.mutedUntil)
    if (mutedUntil.getTime() > Date.now()) {
      return
    }

    const new_message = new Message()
    new_message.content = data.message
    new_message.conversation = conv
    new_message.sender = user
    await this.messageService.createMessage(new_message)


    this.connectedClients.forEach((unauth) => {

      const client = getCoolClients().find((v) => v.socket.id === unauth.id)
      if (!client) {
        return
      }

      if (conv.users.find((v) => v.user.id === client.user.id) === undefined) {
        return
      }

      console.log(`SEND MESSAGE => ${client.user.username} => ${new_message.content} in ${new_message.conversation.title}`)
      client.socket.emit('receive_message',
      {
        conversation_id: data.conversation_id,
        message: new_message
      })
    })
  }
}
