import { Socket } from 'socket.io'

import { User } from 'src/db/user'
import { config_jwt } from 'src/config'
import { JwtPayload } from 'src/auth/interfaces'

import { CoolSocketPayload, Client } from '.'

const connectedClients: Client[] = []

export function getCoolClients(): Client[] {
	return connectedClients
}

export function CoolSocket(debug: boolean = false) {

	function debug_msg(...args) {
		if (debug)
			console.log(...args)
	}

	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value

		descriptor.value = async function (s: Socket, data: CoolSocketPayload) {

			if (debug) {
				debug_msg(`Received message: `)
				debug_msg(`===RAW DATA===`)
				debug_msg(`${JSON.stringify(data, undefined, 4)}`)
				debug_msg(`===END RAW DATA===`)
			}

			let client = connectedClients.find((v) => v.socket.id === s.id)
			if (client) {
				debug_msg(`-> User already in connectedClients`)
				debug_msg(`-> HANDLING MESSAGE FROM: ${client.user.username}`)
				return originalMethod.apply(this, [client, ...Object.values(data.data)])
			}

			try {
				const payload: JwtPayload = await this.authService.verifyJWT(data.token, config_jwt.secret_token)
				if (payload) {

					const user = await this.userService.getUser({ id: payload.id })
					if (user) {
						client = { socket: s, user: user }
						debug_msg(`-> User not in connectedClients, adding...`)
						connectedClients.push(client)
						debug_msg(`-> HANDLING MESSAGE FROM: ${client.user.username}`)
						return originalMethod.apply(this, [client, ...Object.values(data.data)])
					} else {
						debug_msg(`-> Bad user`)
					}
				} else {
					debug_msg(`-> Bad payload`)
				}
			} catch (e) {
				debug_msg(`-> AN ERROR OCCURED`)
				console.error(e)
				return
			}
		}
		return descriptor
	}
}
