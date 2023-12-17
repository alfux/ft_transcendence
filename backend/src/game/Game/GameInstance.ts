
import { Client } from "src/socket/";

import { Clock } from "./Clock";
import { Vec3, distance, norm, scalaire, clamp } from './Math'
import { Obstacle } from "./Obstacle";
import { Ball } from "./Ball";

class	Keyboard {
	key: {[key: string]: boolean};

	constructor() {
		this.key = {};
	}
};

function impact(ball: Ball, obstacle: Obstacle) {
  const d = new Vec3(
    obstacle.direction.y,
    -obstacle.direction.x,
    (obstacle.direction.y * (obstacle.position.x - ball.position.x)
      - obstacle.direction.x * (obstacle.position.y - ball.position.y))
  );
  const sol1 = new Vec3();
  const sol2 = new Vec3();
  const delta = new Vec3();

  if (d.x !== 0) {
    delta.z = 4 * d.x * d.x * ((d.x * d.x + d.y * d.y) * ball.radius - d.z * d.z);
    if (delta.z < 0)
      return (undefined);
    sol1.y = (2 * d.y * d.z + Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
    sol1.x = (d.z - d.y * sol1.y) / d.x;
    sol1.x += ball.position.x;
    sol1.y += ball.position.y;
    if (delta.z === 0)
      return ((distance(sol1, obstacle.position) > obstacle.radius) ? undefined : sol1);
    sol2.y = (2 * d.y * d.z - Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
    sol2.x = (d.z - d.y * sol2.y) / d.x;
    sol2.x += ball.position.x;
    sol2.y += ball.position.y;
    delta.x = distance(sol1, obstacle.position);
    delta.y = distance(sol2, obstacle.position);
    if (delta.x <= obstacle.radius && delta.y <= obstacle.radius) {
      sol1.x = (sol1.x + sol2.x) / 2;
      sol1.y = (sol1.y + sol2.y) / 2;
      return (sol1);
    }
    else if (delta.x <= obstacle.radius)
      return (sol1);
    else if (delta.y <= obstacle.radius)
      return (sol2);
    else
      return (undefined);
  }
  else if (d.y !== 0) {
    delta.z = 4 * d.y * d.y * ((d.x * d.x + d.y * d.y) * ball.radius - d.z * d.z);
    if (delta.z < 0)
      return (undefined);
    sol1.x = (2 * d.x * d.z + Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
    sol1.y = (d.z - d.x * sol1.x) / d.y;
    sol1.x += ball.position.x;
    sol1.y += ball.position.y;
    if (delta.z === 0)
      return ((distance(sol1, obstacle.position) > obstacle.radius) ? undefined : sol1);
    sol2.x = (2 * d.x * d.z - Math.sqrt(delta.z)) / (2 * (d.x * d.x + d.y * d.y));
    sol2.y = (d.z - d.x * sol2.x) / d.y;
    sol2.x += ball.position.x;
    sol2.y += ball.position.y;
    delta.x = distance(sol1, obstacle.position);
    delta.y = distance(sol2, obstacle.position);
    if (delta.x <= obstacle.radius && delta.y <= obstacle.radius) {
      sol1.x = (sol1.x + sol2.x) / 2;
      sol1.y = (sol1.y + sol2.y) / 2;
      return (sol1);
    }
    else if (delta.x <= obstacle.radius)
      return (sol1);
    else if (delta.y <= obstacle.radius)
      return (sol2);
    else
      return (undefined);
  }
  else
    return (undefined);

}

function    manageSpin(ball: Ball, obstacle: Obstacle, tmp: Vec3)
{
	const	way = new Vec3(
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.x,
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.y,
		Math.sign(obstacle.speed ? obstacle.speed : 1) * obstacle.direction.z
	);
	const	spin = scalaire(ball.speed, way) / norm(ball.speed);
    tmp.set(
        tmp.x + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.x,
        tmp.y + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.y,
        tmp.z + Math.abs(obstacle.speed - ball.spin) * Math.sign(-ball.spin ? -ball.spin : 1) * way.z
    );
    ball.spin = ((1 - spin) * obstacle.speed + ball.spin) / 2;
}

function	manageDir(imp: Vec3, obstacle: Obstacle, tmp: Vec3) {
	const	t = distance(imp, obstacle.position);

	if (obstacle.position.x * Math.sign(obstacle.position.x) !== 14)
		return ;
	tmp.set(
		tmp.x + imp.x - obstacle.position.x,
		tmp.y + imp.y - obstacle.position.y,
		tmp.z + imp.z - obstacle.position.z
	);
}

function	bounce(ball: Ball, obstacle: Obstacle, imp: Vec3, classic: boolean)
{
	const	normal = new Vec3(ball.position.x - imp.x, ball.position.y - imp.y, ball.position.z - imp.z);
	const	nspeed = norm(ball.speed);
	let		tmp = new Vec3();
	let		n = norm(normal);

	normal.set(normal.x / n, normal.y / n, normal.z / n);
	n = scalaire(ball.speed, normal);
	if (n > 0)
		return (false);
	normal.set(-normal.x * n, -normal.y * n, -normal.z * n);
	tmp.set(
		2 * normal.x + ball.speed.x,
		2 * normal.y + ball.speed.y,
		2 * normal.z + ball.speed.z
	);
	if (classic)
		manageDir(imp, obstacle, tmp);
	else
		manageSpin(ball, obstacle, tmp);
	n = norm(tmp);
	ball.speed.set(nspeed * tmp.x / n, nspeed * tmp.y / n, nspeed * tmp.z / n);
	return (true);
}

export interface Player {
	client: Client,
	racket: Obstacle,
	keyboard: Keyboard,
	mouse: {x: number, y: number, sx: number, sy: number}
}

export class GameInstance {

  static max_score = 11

  player1: Player
  player2: Player

  score_p1: number = 0
  score_p2: number = 0

  clock: Clock = new Clock(false)
  ball: Ball = new Ball(0.5)
  max_bounce: number = 0;
  finished: boolean;
  obstacles: { [key:string]: Obstacle } & {
    upper_border:Obstacle,
    lower_border:Obstacle,
    left_racket:Obstacle,
    right_racket:Obstacle,
  } = {
    upper_border:new Obstacle(new Vec3(0, 9, 0), new Vec3(-1, 0, 0), 16, 0),
    lower_border:new Obstacle(new Vec3(0, -9, 0), new Vec3(1, 0, 0), 16, 0),
    left_racket:new Obstacle(new Vec3(-14, 0, 0), new Vec3(0, -1, 0), 2, 0),
    right_racket:new Obstacle(new Vec3(14, 0, 0), new Vec3(0, 1, 0), 2, 0),
  }

  delta_time: number = 0

  notif_ball_pos:(ball:Ball)=>void
  notif_end:(winner:Client, looser:Client)=>void

  classic_mode: boolean;

  constructor(player1: Client, player2: Client, notif_ball_pos:(ball:Ball)=>void, notif_end:(winner:Client, looser:Client)=>void, classic: boolean = false) {
    this.player1 = {
		client: player1,
		racket: this.obstacles.left_racket,
		keyboard: new Keyboard(),
		mouse: {x: 0, y: 0, sx: 0, sy: 0}
	}
    this.player2 = {
		client: player2,
		racket: this.obstacles.right_racket,
		keyboard: new Keyboard(),
		mouse: {x: 0, y: 0, sx: 0, sy: 0}
	}
    this.notif_ball_pos = notif_ball_pos
    this.notif_end = notif_end
	this.classic_mode = classic;
	this.max_bounce = 0;
	this.finished = false;
  }

  get_by_user_id(user_id:number) {
    if (this.player1.client.user.id === user_id)
      return this.player1
    else if (this.player2.client.user.id === user_id)
      return this.player2
    return undefined
  }

  get_by_socket_id(socket_id:string) {
    if (this.player1.client.socket.id === socket_id)
      return this.player1
    else if (this.player2.client.socket.id === socket_id)
      return this.player2
    return undefined
  }

  other_one(client:Client) {
    return client.socket.id === this.player1.client.socket.id ? this.player2.client : this.player1.client
  }

	start() {
		this.clock.start()
		this.player1.client.socket.emit("start", {
			opponent: this.player2.client.user,
			you: this.player1.client.user
		});
		this.player2.client.socket.emit("start", {
			opponent: this.player1.client.user,
			you: this.player2.client.user
		});
	}

	keyboardPos() {
    	let move = 0;
    	let speed;

		speed = 0;
    	if (this.player2.keyboard.key?.ArrowDown)
			speed += -5;
    	if (this.player2.keyboard.key?.ArrowUp)
			speed += 5;
		move = speed * this.delta_time;
		this.player2.racket.position.y = clamp(
			this.player2.racket.position.y + move, -7, 7
		);
		this.player2.racket.speed = speed / 5; // Tune down probably

		speed = 0;
		if (this.player1.keyboard.key?.ArrowDown)
			speed += 5;
		if (this.player1.keyboard.key?.ArrowUp)
			speed += -5;
		move = -speed * this.delta_time;
		this.player1.racket.position.y = clamp(
			this.player1.racket.position.y + move, -7, 7
		);
		this.player1.racket.speed = speed / 5; // Tune down probably
	}

	mousePos() {
		let	buffer: number;

		buffer = clamp(this.player1.mouse.y, -7, 7);
		this.player1.racket.speed = (this.player1.racket.position.y - buffer) / (this.delta_time + 0.000001);
		this.player1.racket.position.y = buffer;

		buffer = clamp(this.player2.mouse.y, -7, 7);
		this.player2.racket.speed = (buffer - this.player2.racket.position.y) / (this.delta_time + 0.000001);
		this.player2.racket.position.y = buffer;
	}

	updatePlayerPos() {
		if (this.classic_mode)
			this.keyboardPos();
		else
			this.mousePos();

		this.player1.client.socket.emit("player_pos", {
			you: this.player1.racket,
			opponent: this.player2.racket
		});
		this.player2.client.socket.emit("player_pos", {
			you: this.player2.racket,
			opponent: this.player1.racket
		});
  }

  updateScore() {
    this.player1.client.socket.emit("score", {
      you: this.score_p1,
      opponent: this.score_p2
    })
    this.player2.client.socket.emit("score", {
      you: this.score_p2,
      opponent: this.score_p1
    })

    if (this.score_p1 >= GameInstance.max_score)
      this.finish(this.player1.client, "won")
    else if (this.score_p2 >= GameInstance.max_score)
      this.finish(this.player2.client, "won")

  }

	pushdir() {
		let	n = norm(this.ball.speed);

		if (this.max_bounce < 4) {
			this.max_bounce++;
			return ;
		}
		this.max_bounce = 0;
		this.ball.speed.x += Math.sign(scalaire(this.ball.speed, new Vec3(1, 0, 0)));
		n /= norm(this.ball.speed);
		this.ball.speed.set(
			this.ball.speed.x * n,
			this.ball.speed.y * n,
			this.ball.speed.z * n
		);
	}

  updateBallPos() {
    this.ball.position.x += this.delta_time * this.ball.speed.x * 2;
    this.ball.position.y += this.delta_time * this.ball.speed.y * 2;

    if (this.ball.position.x > 16) {
      this.score_p1++;
      this.updateScore()
      this.ball.position = Vec3.zero();
    }
    else if (this.ball.position.x < -16) {
      this.score_p2++;
      this.updateScore()
      this.ball.position = Vec3.zero();
    }

    let imp;
    for (const key in this.obstacles) {
      imp = impact(this.ball, this.obstacles[key]);
      if (imp !== undefined) {
        if (bounce(this.ball, this.obstacles[key], imp, this.classic_mode)) {
			if (key === "upper_border" || key === "lower_border")
				this.pushdir();
			else
				this.max_bounce = 0;
		}
	  }
    }

    this.notif_ball_pos(this.ball)
  }

  disconnect(client:Client) {
    console.log("Player disconnected !")
    this.finish(this.other_one(client), "disconnect")
  }

  finish(winner:Client, reason:string) {
	if (this.finished)
		return ;
	this.finished = true;
	this.player1.racket.position.y = 0;
	this.player1.racket.speed = 0;
	this.player2.racket.position.y = 0;
	this.player2.racket.speed = 0;
	this.max_bounce = 0;
	this.ball.spin = 0;
	this.update();
    this.notif_end(winner, this.other_one(winner))

    this.player1.client.socket.emit("finish", {
      winner: winner.socket.id === this.player1.client.socket.id ? "you" : "opponent",
      reason: reason
    })

    this.player2.client.socket.emit("finish", {
      winner: winner.socket.id === this.player2.client.socket.id ? "you" : "opponent",
      reason: reason
    })

  }

  update() {
	this.updateBallPos();
	this.updatePlayerPos();
    this.delta_time = this.clock.getDelta();
  }
}
