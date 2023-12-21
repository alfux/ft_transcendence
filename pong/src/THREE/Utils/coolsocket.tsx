import { Socket, io } from "socket.io-client";

export class CoolSocket extends Socket {
	token: string | undefined = undefined
	original_emit: (event: any, ...args: any[]) => any = (e: any, ...arg: any[]) => { }
}

function promoteToCoolSocket(socket: Socket, token: string | undefined): CoolSocket {
	const cool_socket = socket as CoolSocket

	cool_socket.original_emit = socket.emit;
	cool_socket.token = token;

	socket.emit = (event: any, ...args: any[]): any => {
		return cool_socket.original_emit(event, {
			token: token,
			data: { ...args }
		})
	}
	return cool_socket
}

export function coolSocket(url: string, token: string | undefined): CoolSocket {
	return promoteToCoolSocket(io(url, { transports: ["websocket"] }), token)
}
