// src/chat/chat.gateway.ts

import { Inject, forwardRef } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService } from 'src/auth/auth.service'
import { UserService } from 'src/db/user'
import { NotificationsService } from './notifications.service'
import { config_jwt } from 'src/config'
import { CoolSocket } from 'src/socket'


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

  async handleDisconnect(client: Socket): Promise<any> {
    this.notificationService.removeClient(client)
  }

  @SubscribeMessage("auth")
  @CoolSocket
  async auth(client: Socket, data: string) {
    const jwt_payload = await this.authService.verifyJWT(data, config_jwt.secret_token)
    if (!jwt_payload) {
      return
    }
    const user = await this.userService.getUser({id:jwt_payload.id})
    if (!user) {
      return
    }
    console.log("NOTIFICATIONS => ", user.id, client.id)
    this.notificationService.addClient(client, user)
  }

}
