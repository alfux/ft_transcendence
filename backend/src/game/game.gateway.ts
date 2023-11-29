// src/chat/chat.gateway.ts

import { UseGuards } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { AuthService, JwtAuthGuard } from 'src/auth'
import { ConversationService } from 'src/db/conversation'
import { MessageService } from 'src/db/message'
import { User, UserService } from 'src/db/user'
import { Message } from 'src/db/message'


interface Player {
  socket: Socket,
  user: User
}

interface Vec2 {
  x:number,
  y:number
}

class GameInstance {

  player1:Player
  player2:Player

  p1_pos:Vec2
  p2_pos:Vec2

  constructor(player1:Player, player2:Player) {
    this.player1 = player1
    this.player2 = player2
  
    this.p1_pos = {x:0, y:0}
    this.p2_pos = {x:0, y:0}
  }
  
  start() {
    this.player1.socket.emit("start", {
      opponent:this.player2
    })
    this.player2.socket.emit("start", {
      opponent:this.player1
    })
  }

}


@WebSocketGateway({namespace:'game'})
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server
  private connectedClients: Player[] = []
  private waiting: Player[] = []
  private gameInstances:GameInstance[] = []

  constructor (
    private authService: AuthService,
    private userService: UserService
  ) {}

  async handleConnection(client: any, ...args: any[]) {  
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.connectedClients = this.connectedClients.filter((v) => v.socket === client)
    this.waiting = this.waiting.filter((v) => v.socket === client)
  }

  @SubscribeMessage('authentification')
  async handleAuth(client: Socket, token: string)
  {
    const payload = this.authService.verifyJWT(token)
    if (!payload)
      return
    const user = await this.userService.getUser({id:payload.sub})
    this.connectedClients.push({socket:client, user:user})
  }

  @SubscribeMessage('search')
  async handleSearch(s: Socket) {
    const client = this.connectedClients.find((v) => v.socket === s)
    if (!client)
      return

    this.waiting.push(client)

    if (this.waiting.length >= 2) {
      const p1 = this.waiting[0]
      const p2 = this.waiting[1]
      this.waiting = this.waiting.filter((v) => v.socket !== p1.socket && v.socket !== p2.socket)
    
      const gameInstance = new GameInstance(p1, p2)
      this.gameInstances.push(gameInstance)
      gameInstance.start()
    }
  }

}
