import { Socket } from 'socket.io'

import { User } from 'src/db/user'

export interface Client {
	socket: Socket,
	user: User
}