import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { UserService } from 'src/db/user'
import { Client, CoolSocket, getCoolClients } from 'src/socket/'

import { PrivateMessage, PrivateMessageService } from 'src/db/private_conversation/private_message'
import { AuthService } from 'src/auth'
import { Inject, forwardRef } from '@nestjs/common'
import { PRIVATE_CONVERSATION_DEFAULT, PrivateConversationService } from './private_conversation.service'

@WebSocketGateway({ namespace: 'private_chat' })
export class PrivateConversationGateway implements OnGatewayConnection {

	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService, //NE PAS ENELEVER
		@Inject(forwardRef(() => UserService))
		private userService: UserService, //NE PAS ENELEVER

		private privateMessageService: PrivateMessageService,
		private privateConversationService: PrivateConversationService
	) { }

	@WebSocketServer() server: Server

	connectedClients: Socket[] = []

	async handleConnection(client: Socket) {
		console.log(client.id)
		this.connectedClients.push(client)
	}

	async handleDisconnect(client: Socket): Promise<any> {
		this.connectedClients = this.connectedClients.filter((c) => c.id !== client.id)
	}

	@SubscribeMessage('auth')
	@CoolSocket()
	async handleAuth() { }

	@SubscribeMessage('send_message')
	@CoolSocket()
	async handleMessage(client: Client, data: { message: string, conversation_id: number }): Promise<void> {
		console.log(data)
		const conv = await this.privateConversationService.getPrivateConversation({ id: data.conversation_id }, ['users', 'messages'])
		

		const user = conv.users.find((v) => v.id === client.user.id)
		console.log(user)
		if (user === undefined)
			return

		const new_message = new PrivateMessage()
		new_message.content = data.message
		new_message.conversation = conv
		new_message.sender = user
		await this.privateMessageService.createMessage(new_message)

		console.log(new_message)


		this.connectedClients.forEach((unauth) => {

			const client = getCoolClients().find((v) => v.socket.id === unauth.id)
			if (!client) {
				return
			}

			if (conv.users.find((v) => v.id === client.user.id) === undefined) {
				return
			}

			client.socket.emit('receive_message',
				{
					conversation_id: data.conversation_id,
					message: new_message
				})
		})
	}
}
