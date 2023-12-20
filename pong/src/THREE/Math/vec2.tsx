import { clamp } from "./math";

export class Vec2 {
  x: number;
  y: number;

  static zero() { return new Vec2(0, 0) }
  static one() { return new Vec2(1, 1) }

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  clamp(min: number, max: number) {
    this.x = clamp(this.x, min, max)
    this.y = clamp(this.y, min, max)
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

};