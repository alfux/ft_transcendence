import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { User, UserService } from 'src/db/user'
import { Client, CoolSocket, getCoolClients } from 'src/socket/'
import { ConversationService } from 'src/db/conversation'

import { Message, MessageService } from 'src/db/conversation/message'
import { HttpUnauthorized } from 'src/exceptions'
import { AuthService } from 'src/auth'

@WebSocketGateway({ namespace: 'chat' })
export class ConversationGateway implements OnGatewayConnection {

  constructor(
    private authService: AuthService, //NE PAS ENELEVER
    private userService: UserService, //NE PAS ENELEVER
    private messageService: MessageService,
    private conversationService: ConversationService
  ) { }

  @WebSocketServer() server: Server

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
  }

  @SubscribeMessage('send_message')
  @CoolSocket
  async handleMessage(client: Client, data: { message: string, conversation_id: number }): Promise<void> {
    const conv = await this.conversationService.getConversation({ id: data.conversation_id }, ['users', 'users.user'])

    const user = conv.users.find((v) => v.user.id === client.user.id)
    if (!user)
      throw new HttpUnauthorized()

    const new_message = new Message()
    new_message.content = data.message
    new_message.conversation = conv
    new_message.sender = user
    await this.messageService.createMessage(new_message)

    getCoolClients().forEach((value) => {
      if (conv.users.find((v) => v.user.id === value.user.id)) {
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
