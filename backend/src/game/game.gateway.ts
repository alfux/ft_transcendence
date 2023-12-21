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

class Keyboard {
	key: { [key: string]: boolean };
};

function remove_client(client: Client | Socket, queue: Client[]) {
	const s = client instanceof Socket ? client : client.socket
	return queue.filter((v) => v.socket !== s)
}

function remove_client_all(client: Client | Socket, queues: Record<GameMode, Client[]>) {
	for (const key in queues) {
		queues[key] = remove_client(client, queues[key])
	}
}

function is_in_queue(client: Client | Socket, queue: Client[]): Client | undefined {
	const s = client instanceof Socket ? client : client.socket
	return queue.find((c) => c.socket === s)
}

function is_in_queue_all(client: Client | Socket, queues: Record<GameMode, Client[]>) {
	for (const key in queues) {
		if (is_in_queue(client, queues[key]))
			return true
	}
	return false
}


@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection {

	@WebSocketServer() server: Server
	private connectedClients: Client[] = []
	private gameInstances: GameInstance[] = []

	private queues: Record<GameMode, Client[]> = {} as Record<GameMode, any[]>

	constructor(
		@Inject(forwardRef(() => AuthService))
		private authService: AuthService, //NE PAS ENELEVER
		@Inject(forwardRef(() => UserService))
		private userService: UserService, //NE PAS ENELEVER

		private matchService: MatchService,

		private notificationsService: NotificationsService

	) {
		Object.keys(GameMode).forEach((key) => {
			this.queues[key] = [];
		});
	}


	async handleConnection(client: Socket) {
	}

	async handleDisconnect(client: Socket): Promise<any> {
		this.connectedClients = this.connectedClients.filter((v) => v.socket !== client)
		remove_client_all(client, this.queues)

		const game_instance = this.gameInstances.find((gi) => gi.player1.client.socket.id === client.id || gi.player2.client.socket.id === client.id)
		if (!game_instance)
			return
		const player = game_instance.get_by_socket_id(client.id)
		if (!player)
			return

		game_instance.disconnect(player.client)
	}

	@SubscribeMessage('auth')
	@CoolSocket()
	async handleAuth() { }

	@SubscribeMessage('cancel_search')
	@CoolSocket()
	async handleCancelSearch(client: Client) {
		remove_client_all(client, this.queues)
	}

	@SubscribeMessage('search')
	@CoolSocket()
	async handleSearch(client: Client, data: { mode: GameMode }) {
		if (is_in_queue_all(client, this.queues)) {
			return
		}

		this.queues[data.mode].push(client)
		if (this.queues[data.mode].length >= 2) {

			const p1 = this.queues[data.mode][0]
			const p2 = this.queues[data.mode][1]

			this.queues[data.mode] = remove_client(p1, this.queues[data.mode])
			this.queues[data.mode] = remove_client(p2, this.queues[data.mode])


			console.log(`STARTING GAME '${data.mode}': p1:${p1.user.username} p2:${p2.user.username}`)

			const gameInstance = new GameInstance(p1, p2, data.mode,
				async (winner, looser) => {
					this.gameInstances = this.gameInstances.filter((v) => v !== gameInstance)
					this.matchService.createMatch({
						players: [winner.user, looser.user],
						winner: winner.user
					})

					this.userService.updateUserStatus(p1.user, LoggedStatus.Logged)
					this.userService.updateUserStatus(p2.user, LoggedStatus.Logged)
				}
			);

			this.userService.updateUserStatus(p1.user, LoggedStatus.InGame)
			this.userService.updateUserStatus(p2.user, LoggedStatus.InGame)

			this.gameInstances.push(gameInstance)
			gameInstance.start()
		}
	}

	@SubscribeMessage('player_input')
	@CoolSocket()
	async handlePlayerInput(client: Client, keyboard: Keyboard) {

		const game_instance = this.gameInstances.find((gi) =>
			gi.player1.client.socket.id === client.socket.id ||
			gi.player2.client.socket.id === client.socket.id)
		if (!game_instance || !game_instance.running)
			return

		if (game_instance.player1.client.socket.id === client.socket.id)
			game_instance.player1.keyboard = keyboard;
		else
			game_instance.player2.keyboard = keyboard;
	}

	@SubscribeMessage("pointer")
	@CoolSocket()
	async handlePlayerPointer(client: Client, mouse: { x: number, y: number, sx: number, sy: number }) {
		const game_instance = this.gameInstances.find((gi) =>
			gi.player1.client.socket.id === client.socket.id ||
			gi.player2.client.socket.id === client.socket.id)
		if (!game_instance || !game_instance.running)
			return;

		if (mouse.x && mouse.y) {
			if (game_instance.player1.client.socket.id === client.socket.id)
				game_instance.player1.mouse = mouse;
			else
				game_instance.player2.mouse = mouse;
		}
	}

	@Interval(1 / 60)
	loop() {
		this.gameInstances.forEach((gi) => {
			if (gi.running)
				gi.update()
		})
	}

}
