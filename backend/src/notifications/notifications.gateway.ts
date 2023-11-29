// src/chat/chat.gateway.ts

import { Inject, forwardRef } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService, JwtAuthGuard } from 'src/auth'
import { ConversationService } from 'src/db/conversation'
import { MessageService } from 'src/db/message'
import { User, UserService } from 'src/db/user'
import { Message } from 'src/db/message'
import { NotificationsService } from './notifications.service'


@WebSocketGateway({namespace:'notifications'})
export class NotificationsGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server

  constructor (
      private notificationService: NotificationsService,
      @Inject(forwardRef(() => AuthService))
      private authService: AuthService,
      @Inject(forwardRef(() => UserService))
      private userService: UserService
    ) {}

  async handleConnection(client: Socket) {
  }

  @SubscribeMessage('authentification')
  async handleAuth(client: Socket, token: string)
  {
    const payload = this.authService.verifyJWT(token)
    if (!payload)
      return
    const user = await this.userService.getUser({id:payload.sub})
    this.notificationService.addClient(client, user)  
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.notificationService.removeClient(client)
  }

}
