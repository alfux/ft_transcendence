// src/chat/chat.gateway.ts

import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Interval } from '@nestjs/schedule'

import { AuthService } from 'src/auth/'

import { GameInstance, Ball } from './Game'
import { Client, CoolSocket } from 'src/socket/'
import { MatchService, UserService } from 'src/db/user'
import { Inject, forwardRef } from '@nestjs/common'

import { Player } from "./Game/GameInstance";

class Keyboard {
  key: { [key: string]: boolean };
};

@WebSocketGateway({ namespace: 'game' })
export class GameGateway implements OnGatewayConnection {

  @WebSocketServer() server: Server
  private connectedClients: Client[] = []
  private waiting: Client[] = []
  private gameInstances: GameInstance[] = []

  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService, //NE PAS ENELEVER
    @Inject(forwardRef(() => UserService))
    private userService: UserService, //NE PAS ENELEVER

    private matchService: MatchService

  ) { }

  async handleConnection(client: Socket) {
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.connectedClients = this.connectedClients.filter((v) => v.socket !== client)
    this.waiting = this.waiting.filter((v) => v.socket !== client)

    const game_instance = this.gameInstances.find((gi) => gi.player1.client.socket.id === client.id || gi.player2.client.socket.id === client.id)
    if (!game_instance)
      return
    const player = game_instance.get_by_socket_id(client.id)
    if (!player)
      return

    game_instance.disconnect(player.client)
  }
  
  @SubscribeMessage('cancel_search')
  @CoolSocket
  async handleCancelSearch(client: Client) {
    this.waiting = this.waiting.filter((v) => v.user.id !== client.user.id)
  }

  @SubscribeMessage('search')
  @CoolSocket
  async handleSearch(client: Client, classic: boolean) {
    if (this.waiting.find((v) => v.socket.id === client.socket.id)) {
      return
    }

    this.waiting.push(client)

    if (this.waiting.length >= 2) {

      const p1 = this.waiting[0]
      const p2 = this.waiting[1]

      this.waiting = this.waiting.filter((v) => v.socket !== p1.socket && v.socket !== p2.socket)

      console.log("Starting game with: ", p1.user.username, p2.user.username)
      const gameInstance = new GameInstance(p1, p2, (b: Ball) => {
        const inverted = b.clone()
        inverted.position.x *= -1
        inverted.spin *= -1

        p1.socket.emit("ball_pos", inverted)
        p2.socket.emit("ball_pos", b)
      },
        (winner, looser) => {
          this.gameInstances = this.gameInstances.filter((v) => v !== gameInstance)
          this.matchService.createMatch({
            players: [winner.user, looser.user],
            winner: winner.user
          })
        },
        classic);
      this.gameInstances.push(gameInstance)
      gameInstance.start()
    }
  }

  @SubscribeMessage('player_input')
  @CoolSocket
  async handlePlayerInput(client: Client, keyboard: Keyboard) {

    const game_instance = this.gameInstances.find((gi) =>
      gi.player1.client.socket.id === client.socket.id ||
      gi.player2.client.socket.id === client.socket.id)
    if (!game_instance)
      return

    if (game_instance.player1.client.socket.id === client.socket.id)
      game_instance.player1.keyboard = keyboard;
    else
      game_instance.player2.keyboard = keyboard;
  }

  @SubscribeMessage("pointer")
  @CoolSocket
  async handlePlayerPointer(client: Client, mouse: { x: number, y: number, sx: number, sy: number }) {
    const game_instance = this.gameInstances.find((gi) =>
      gi.player1.client.socket.id === client.socket.id ||
      gi.player2.client.socket.id === client.socket.id)
    if (!game_instance)
      return;

    if (mouse.x && mouse.y) {
      if (game_instance.player1.client.socket.id === client.socket.id)
        game_instance.player1.mouse = mouse;
      else
        game_instance.player2.mouse = mouse;
    }
  }

  @Interval(1 / 60)
  loop() {
    this.gameInstances.forEach((gi) => {
      gi.update()
    })
  }

}
