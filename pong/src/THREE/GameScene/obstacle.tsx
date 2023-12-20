import { Vec3 } from "../Math";
import { Ball } from "./ball";

export class Obstacle {
  position: Vec3;
  direction: Vec3;
  radius: number;
  speed: number;
  gameObject?: THREE.Object3D

  constructor(
    pos: Vec3 = Vec3.zero(),
    dir: Vec3 = Vec3.zero(),
    rad: number = 1,
    spd: number = 0
  ) {
    this.position = pos;
    this.direction = dir;
    this.radius = rad;
    this.speed = spd;
  }

  setRadius(rad: number) {
    this.radius = rad;
  }

  setSpeed(spd: number) {
    this.speed = spd;
  }

  copy(other: Obstacle) {
    this.position = new Vec3(other.position.x, other.position.y, other.position.z)
    this.direction = new Vec3(other.direction.x, other.direction.y, other.direction.z)
    this.radius = other.radius
    this.speed = other.speed
  }

  set(ref?: THREE.Object3D) {
    this.gameObject = ref;
  }
}
