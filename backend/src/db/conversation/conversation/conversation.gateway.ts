import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { User } from 'src/db/user'
import { CoolSocket } from 'src/socket/'
import { ConversationService } from 'src/db/conversation'

import { Message, MessageService } from 'src/db/conversation/message'

@WebSocketGateway({namespace:'chat'})
export class ConversationGateway implements OnGatewayConnection {

  constructor (
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

  @SubscribeMessage('send_message')
  @CoolSocket
  async handleMessage(client: Socket, data: { message: string, conversation_id: number }): Promise<void>
  {
    console.log("message emited")
    const user = this.connectedClients.get(client.id)
    if (!user)
      return

    const conversation = await this.conversationService.getConversation({id:data.conversation_id}, ['messages'])
    
    const new_message = new Message()
    new_message.content = data.message

    await this.messageService.createMessage(new_message)
    this.connectedClients.forEach((value: { socket: Socket, user: any }) => {
      value.socket.emit('receive_message',
        {
          username: user.user.username,
          conversation_id: data.conversation_id,
          message: data.message
        })
    })
  }
}
