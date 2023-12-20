import { Obstacle } from "./obstacle";
import { Ball } from "./ball";
import { Vec3 } from "../Math";

export class GameBoard {
  upper_border: Obstacle;
  lower_border: Obstacle;
  left_racket: Obstacle;
  right_racket: Obstacle;
  ball: Ball;

  constructor() {
    this.upper_border = new Obstacle(new Vec3(0, 9, 0), new Vec3(-1, 0, 0), 16, 0);
    this.lower_border = new Obstacle(new Vec3(0, -9, 0), new Vec3(1, 0, 0), 16, 0);
    this.left_racket = new Obstacle(new Vec3(-14, 0, 0), new Vec3(0, -1, 0), 2, 0);
    this.right_racket = new Obstacle(new Vec3(14, 0, 0), new Vec3(0, 1, 0), 2, 0);
    this.ball = new Ball(0.5);
  }

  set(ref: { ball?: THREE.Object3D, lr?: THREE.Object3D, rr?: THREE.Object3D }) {
    this.ball.set(ref.ball);
    this.left_racket.set(ref.lr);
    this.right_racket.set(ref.rr);
  }
}
