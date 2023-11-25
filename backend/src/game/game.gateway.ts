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
  
}


@WebSocketGateway()
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server
  private connectedClients: Player[]
  private waiting: Player[]
  private gameInstances:GameInstance[]

  constructor (
    ) {}


  async handleConnection(client: Socket) {
    console.log("Game Client connected: ", client.id)
    this.connectedClients.push({socket:client, user:null})
    this.waiting.push({socket:client, user:null})

    if (this.waiting.length >= 2) {
      
    }

  }

  async handleDisconnect(client: Socket): Promise<any> {
    //this.connectedClients.delete(client.id)
  }

  @SubscribeMessage('keydown')
  async handleAuth(client: Socket, key: string) {
    
  }
}
