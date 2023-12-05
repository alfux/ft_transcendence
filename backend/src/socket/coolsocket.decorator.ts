import { Socket } from "socket.io";
import { CoolSocketPayload } from "./coolsocket.interface";
import { Client } from "src/game/Game/GameInstance";
import { config_jwt } from "src/config";

const connectedClients: Client[] = []

export function CoolSocket(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (s: Socket, data: CoolSocketPayload) {
    let client = connectedClients.find((v) => v.socket.id === s.id)
    if (client) {
      return originalMethod.apply(this, [client, ...Object.values(data.data)]);
    }

    const payload = this.authService.verifyJWT(data.token, config_jwt.secret_token)
    if (payload) {
      const user = await this.userService.getUser({ id: payload.sub })
      if (user) {
        client = { socket: s, user: user }
        connectedClients.push(client)
        return originalMethod.apply(this, [client, ...Object.values(data.data)]);
      }
    }
    console.log("Bad auth :/")
  };
  return descriptor;
}
