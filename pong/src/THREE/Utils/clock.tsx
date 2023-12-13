import * as THREE from "three";

export class GameClock {
  clock: THREE.Clock;
  deltaT: number;

  constructor() {
    this.clock = new THREE.Clock();
    this.deltaT = this.clock.getDelta();
  }

  update() {
    this.deltaT = this.clock.getDelta();
  }
}

export const clock = new GameClock();
