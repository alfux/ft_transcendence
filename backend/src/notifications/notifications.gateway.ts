// src/chat/chat.gateway.ts

import { Inject, forwardRef } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService } from 'src/auth/auth.service'
import { UserService } from 'src/db/user'
import { NotificationsService } from './notifications.service'
import { config_jwt } from 'src/config'


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
  async auth(client: Socket, data: {token:any, data: { 0: string }}) {
    const jwt_payload = await this.authService.verifyJWT(data.data[0], config_jwt.secret_token)
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
