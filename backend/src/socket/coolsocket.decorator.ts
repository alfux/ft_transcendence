import { Socket } from 'socket.io'

import { User } from 'src/db/user'
import { config_jwt } from 'src/config'
import { JwtPayload } from 'src/auth/interfaces'

import { CoolSocketPayload, Client } from '.'

const connectedClients: Client[] = []

export function getCoolClients(): Client[] {
	return connectedClients
}

export function CoolSocket(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value

	descriptor.value = async function (s: Socket, data: CoolSocketPayload) {
		let client = connectedClients.find((v) => v.socket.id === s.id)
		if (client) {
			return originalMethod.apply(this, [client, ...Object.values(data.data)])
		}

		try {
			const payload: JwtPayload = await this.authService.verifyJWT(data.token, config_jwt.secret_token)
			if (payload) {

				const user = await this.userService.getUser({ id: payload.id })
				if (user) {
					client = { socket: s, user: user }
					connectedClients.push(client)
					return originalMethod.apply(this, [client, ...Object.values(data.data)])
				}
			}
		} catch (e) {
			console.error(e)
			return
		}
	}
	return descriptor
}
