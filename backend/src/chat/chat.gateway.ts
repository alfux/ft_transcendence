// src/chat/chat.gateway.ts

import { UseGuards } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService, JwtAuthGuard } from 'src/auth'
import { ConversationService } from 'src/db/conversation'
import { MessageService } from 'src/db/message'
import { User, UserService } from 'src/db/user'
import { Message } from 'src/db/message'

@WebSocketGateway({namespace:'chat'})
export class ChatGateway implements OnGatewayConnection {

  constructor (
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private conversationService: ConversationService
    ) {}

  @WebSocketServer() server: Server
  private connectedClients: Map<string, { socket: Socket, user: User }> = new Map()

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.connectedClients.delete(client.id)
  }

  @SubscribeMessage('authentification')
  async handleAuth(client: Socket, token: string)
  {
    const payload = this.authService.verifyJWT(token)
    if (!payload)
      return
    const user = await this.userService.getUser({id:payload.sub})
    this.connectedClients.set(client.id, { socket: client, user })    
  }

  @SubscribeMessage('send_message')
  async handleMessage(client: Socket, data: { message: string, conversation_id: number }): Promise<void>
  {
    const user = this.connectedClients.get(client.id)
    if (!user)
      return

    const conversation = await this.conversationService.getConversation({id:data.conversation_id}, ['messages'])
    
    const new_message = new Message()
    new_message.content = data.message
    //new_message.conversation = conversation
    //new_message.sender = user.user

    await this.messageService.createMessage(new_message)
    
    this.connectedClients.forEach((value: { socket: Socket, user: any }) => {
      value.socket.emit('receive_message', { username: user.user.username, conversation_id: data.conversation_id, message: data.message });
    })
  }
}
