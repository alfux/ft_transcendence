// src/chat/chat.gateway.ts

import { UseGuards } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Interval } from '@nestjs/schedule'

import { AuthService, JwtAuthGuard } from 'src/auth'
import { ConversationService } from 'src/db/conversation'
import { MessageService } from 'src/db/message'
import { User, UserService } from 'src/db/user'
import { Message } from 'src/db/message'

import { Clock } from './Clock'

class	Keyboard
{
	[key: string]: {keydown:boolean, keypress:boolean};
}

interface Client {
  socket: Socket,
  user: User
}

interface Vec2 {
  x:number,
  y:number
}

interface Player {
  client:Client
  pos:Vec2
}

class GameInstance {

  player1:Player
  player2:Player

  clock:Clock

  delta_time:number

  constructor(player1:Client, player2:Client) {
    this.player1 = {client:player1, pos:{x:0, y:0}}
    this.player2 = {client:player2, pos:{x:0, y:0}}

    this.clock = new Clock(false)
    this.delta_time = 0
  }

  start() {
    this.clock.start()
    this.player1.client.socket.emit("start", {
      opponent:this.player2
    })
    this.player2.client.socket.emit("start", {
      opponent:this.player1
    })
  }

  update() {
    this.delta_time = this.clock.getDelta()
    console.log(this.delta_time)
  }

}


@WebSocketGateway({namespace:'game'})
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server
  private connectedClients: Client[] = []
  private waiting: Client[] = []
  private gameInstances:GameInstance[] = []

  constructor (
    private authService: AuthService,
    private userService: UserService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {  
    console.log("Client connected: ", client.id)
  }
  
  async handleDisconnect(client: Socket): Promise<any> {
    console.log("Client disconnected: ", client.id)
    this.connectedClients = this.connectedClients.filter((v) => v.socket === client)
    this.waiting = this.waiting.filter((v) => v.socket === client)
  }
  
  @SubscribeMessage('authentification')
  async handleAuth(client: Socket, token: string)
  {
    console.log("Client auth: ", client.id)
    const payload = this.authService.verifyJWT(token)
    console.log(payload)
    if (!payload)
    {
      console.log("Client auth failed: ", client.id)
      return
    }
    console.log("Client auth success: ", client.id)
    const user = await this.userService.getUser({id:payload.sub})
    this.connectedClients.push({socket:client, user:user})
  }

  @SubscribeMessage('search')
  async handleSearch(s: Socket) {
    console.log("Client search... ", s.id)
    const client = this.connectedClients.find((v) => v.socket === s)
    if (!client) {
      console.log("Client search failed ", s.id)
      return
    }
    console.log("Client search success ", s.id)

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

  @SubscribeMessage('player_input')
  async handlePlayerInput(s:Socket, keyboard: Keyboard) {

    console.log(keyboard)

    const game_instance = this.gameInstances.find((gi) => gi.player1.client.socket === s || gi.player2.client.socket === s)
    const sender = game_instance.player1.client.socket === s ? game_instance.player1 : game_instance.player2
    const receiver = game_instance.player2.client.socket === s ? game_instance.player1 : game_instance.player2

    const	limit = 7;
    let		move = 0;
    let		speed = 20;

    if (keyboard.ArrowDown?.keypress)
        move -= speed * game_instance.delta_time
    if (keyboard.ArrowUp?.keypress)
        move += speed * game_instance.delta_time;
    if (sender.pos.y <= limit)
    {
      sender.pos.y += move;
      //board.right_racket.speed = 0.5 * move / game_instance.delta_time;
    }
    else
    {
      sender.pos.y = (move < 0) ? -limit : limit;
      //board.right_racket.speed = 0;
    }
    receiver.client.socket.emit("player_pos", sender.pos)
  }

  @Interval(1000 / 60)
  loop() {
    this.gameInstances.forEach((gi) => {
      gi.update()
    })
  }


}
