import { Socket, io } from "socket.io-client";

type Mutable<T> = {
    -readonly [K in keyof T]: T[K]
}

export class CoolSocket extends Socket {
    token:string|null=null
    original_emit:(event:any, ...args:any[])=>any=(e:any,...arg:any[]) => {}
}

export function promoteToCoolSocket(socket:Socket, token:string|null): CoolSocket {
    const cool_socket = socket as CoolSocket
    cool_socket.original_emit = socket.emit;
    cool_socket.token = token;
    socket.emit = (event:any, ...args:any[]):any => {
        console.log("emit...", args)
        return cool_socket.original_emit(event, { token: token, data: { ...args } })
    }
    return cool_socket
}