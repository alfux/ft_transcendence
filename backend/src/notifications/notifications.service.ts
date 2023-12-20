import { Injectable } from '@nestjs/common'
import { Socket } from 'socket.io'

import { User } from 'src/db/user'

@Injectable()
export class NotificationsService {

	private connectedClients: Map<Socket, User> = new Map()

	constructor() { }

	addClient(socket: Socket, user: User) {
		this.connectedClients.set(socket, user)
		this.connectedClients.forEach((u, k) => {
			console.log(`${u.username} => ${k.id}`)
		})
	}

	removeClient(client: Socket) {
		this.connectedClients.delete(client)
	}

	get(client: Socket) {
		return this.connectedClients.get(client)
	}

	emit_everyone(event: string, data: any) {
		console.log("Emit for everyone: ", event)

		this.connectedClients.forEach((user, socket) => {
			socket.emit(event, data)
		})
	}

	emit(users: User[], event: string, data: any) {
		for (const [key, value] of this.connectedClients.entries()) {
			if (users.map((v) => v.id).includes(value.id)) {
				console.log("EMIT FOR: ", value.username, event, data)
				key.emit(event, data)
			}
		}
	}
}