// src/chat/chat.gateway.ts

import { Inject, forwardRef } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService } from 'src/auth/auth.service'
import { LoggedStatus, UserService } from 'src/db/user'
import { NotificationsService } from './notifications.service'
import { config_jwt } from 'src/config'
import { CoolSocket } from 'src/socket'


@WebSocketGateway({ namespace: 'notifications' })
export class NotificationsGateway implements OnGatewayConnection {

	@WebSocketServer() server: Server

	constructor(
		private notificationService: NotificationsService,
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService,
		@Inject(forwardRef(() => UserService))
		private userService: UserService
	) { }

	async handleConnection(client: Socket) {
	}

	async handleDisconnect(client: Socket): Promise<any> {

		const user = this.notificationService.get(client)
		
		this.userService.updateUserStatus(user, LoggedStatus.Unlogged)

		this.notificationService.removeClient(client)
	}

	@SubscribeMessage("auth")
	async auth(client: Socket, data: { token: any, data: { 0: string } }) {
		const jwt_payload = await this.authService.verifyJWT(data.data[0], config_jwt.secret_token)
		if (!jwt_payload) {
			return
		}
		const user = await this.userService.getUser({ id: jwt_payload.id })
		if (!user) {
			return
		}

		await this.userService.updateUserStatus(user, LoggedStatus.Logged)
		this.notificationService.addClient(client, user)
	}

}
