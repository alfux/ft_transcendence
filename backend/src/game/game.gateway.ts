import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Interval } from '@nestjs/schedule'

import { AuthService } from 'src/auth/'

import { GameInstance, Ball } from './Game'
import { Client, CoolSocket } from 'src/socket/'
import { LoggedStatus, MatchService, UserService } from 'src/db/user'
import { Inject, forwardRef } from '@nestjs/common'
import { GameMode } from './Game/GameMode'
import { NotificationsService } from 'src/notifications'
import { GameService } from './game.service'

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection {

	@WebSocketServer() server: Server

	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService, //NE PAS ENELEVER
		@Inject(forwardRef(() => UserService))
		private userService: UserService, //NE PAS ENELEVER

		private gameService: GameService
	) {
	}


	async handleConnection(client: Socket) {
	}

	async handleDisconnect(client: Socket): Promise<any> {
		this.gameService.handleDisconnect(client)
	}

	@SubscribeMessage('auth')
	@CoolSocket()
	async handleAuth() { }

	@SubscribeMessage('cancel_search')
	@CoolSocket()
	async handleCancelSearch(client: Client) {
		this.gameService.handleCancelSearch(client)
	}

	@SubscribeMessage('search')
	@CoolSocket()
	async handleSearch(client: Client, data: { mode: GameMode }) {
		this.gameService.handleSearch(client, data)
	}

	@SubscribeMessage('player_input')
	@CoolSocket()
	async handlePlayerInput(client: Client, keyboard: any) {
		this.gameService.handlePlayerInput(client, keyboard)
	}

	@SubscribeMessage("pointer")
	@CoolSocket()
	async handlePlayerPointer(client: Client, mouse: { x: number, y: number, sx: number, sy: number }) {
		this.gameService.handlePlayerPointer(client, mouse)
	}

}
