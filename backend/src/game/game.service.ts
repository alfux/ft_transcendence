import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { Socket } from 'socket.io'
import { Client, CoolSocket } from 'src/socket/'
import { LoggedStatus, MatchService, User, UserService } from 'src/db/user'
import { GameMode } from './Game/GameMode'
import { GameInstance } from './Game'
import { Interval } from '@nestjs/schedule'

class Keyboard {
	key: { [key: string]: boolean };
};

function hasDuplicate(numbers: number[]): boolean {
	const numberSet = new Set(numbers);
	return numbers.length !== numberSet.size;
}

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


@Injectable()
export class GameService {

	private connectedClients: Client[] = []
	private gameInstances: GameInstance[] = []
	private queues: Record<GameMode, Client[]> = {} as Record<GameMode, any[]>

	constructor(
		@Inject(forwardRef(() => UserService))
		private userService: UserService, //NE PAS ENELEVER
		
		
		@Inject(forwardRef(() => MatchService))
		private matchService: MatchService,
	) {
		Object.keys(GameMode).forEach((key) => {
			this.queues[key] = [];
		});
	}

	handleAuth(client: Client) {
		this.connectedClients.push(client)
	}

	handleDisconnect(client: Socket) {
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

	handleCancelSearch(client: Client) {
		remove_client_all(client, this.queues)
	}

	handleSearch(client: Client, data: { mode: GameMode }) {
		if (is_in_queue_all(client, this.queues)) {
			return
		}

		this.queues[data.mode].push(client)
		if (this.queues[data.mode].length >= 2) {

			const p1 = this.queues[data.mode][0]
			const p2 = this.queues[data.mode][1]

			this.queues[data.mode] = remove_client(p1, this.queues[data.mode])
			this.queues[data.mode] = remove_client(p2, this.queues[data.mode])

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

	handlePlayerInput(client: Client, keyboard: Keyboard) {

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


	handlePlayerPointer(client: Client, mouse: { x: number, y: number, sx: number, sy: number }) {
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

	startGameWith(user1: User, user2: User) {
		const p1 = this.connectedClients.find((v) => v.user.id === user1.id)
		const p2 = this.connectedClients.find((v) => v.user.id === user2.id)
		
		if (p1 === undefined || p2 === undefined)
			return

		let alreadyInGame = false
		this.gameInstances.forEach((gi) => {
			if (alreadyInGame) {
				return
			}
			
			const players = [gi.player1.client.user.id, gi.player2.client.user.id, p1.user.id, p2.user.id]
			if (hasDuplicate(players)) {
				alreadyInGame = true
			}
		})

		const gameInstance = new GameInstance(p1, p2, GameMode.MAGNUS,
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


	@Interval(1 / 60)
	loop() {
		this.gameInstances.forEach((gi) => {
			if (gi.running)
				gi.update()
		})
	}

}