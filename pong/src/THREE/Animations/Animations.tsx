import * as THREE from "three"
import { EaseFunction, Ease } from "./Ease"
import { Clock } from './Clock'
import { lerp } from "three/src/math/MathUtils"

const defaultEaseOvershootOrAmplitude = 1.70158
const defaultEasePeriod = 0

const interpolantTreshold = 0.99999

export class Animation<T> {
  from: T
  to: T
  duration: number
  interpolate: (from: T, to: T, t: number) => T
  getter?: () => T
  setter: (new_value: T) => void
  ease: EaseFunction
  onStart?: () => void
  onFinish?: () => void
  onUpdate?: (t: number) => void

  current: T

  clock: Clock = new Clock()
  running: boolean = false
  iteration: number = 0

  static running_animations: Animation<any>[] = []

  constructor(params: {
    from: T,
    to: T,
    duration: number,
    interpolate: (from: T, to: T, t: number) => T,
    getter?: () => T,
    setter: (new_value: T) => void,
    ease?: EaseFunction,
    onStart?: () => void,
    onFinish?: () => void,
    onUpdate?: (t: number) => void,
  }) {
    this.from = params.from
    this.to = params.to
    this.duration = params.duration
    this.interpolate = params.interpolate
    this.getter = params.getter
    this.setter = params.setter

    if (params.ease)
      this.ease = params.ease
    else
      this.ease = Ease.Default

    this.onStart = params.onStart
    this.onFinish = params.onFinish
    this.onUpdate = params.onUpdate

    this.current = params.from
  }

  start() {
    if (!this.running) {

      if (this.from === this.to) {
        this.finish()
        return
      }
      if (this.onStart)
        this.onStart()
      this.running = true
      this.clock.start()
      this.__loop()
    }
  }

  stop() {
    if (this.running) {
      this.running = false
      this.clock.stop()
    }
  }

  finish() {
    if (this.onFinish)
      this.onFinish()
    this.setter(this.to)
    this.stop()
  }

  __loop() {
    if (this.running === false)
      return

    var time = this.clock.getElapsedTime() / 1000
    var interpolant = this.ease(time, this.duration, defaultEaseOvershootOrAmplitude, defaultEasePeriod)

    if (time / this.duration >= interpolantTreshold) {
      this.finish()
      return
    }

    this.onUpdate?.(interpolant)

    this.setter(this.interpolate(this.from, this.to, interpolant))
    this.iteration++
    requestAnimationFrame(() => { this.__loop() })
  }

  static cleanup() {
    for (var i = 0; i < Animation.running_animations.length; i++) {
      Animation.running_animations[i].stop()
    }
  }

}

export function interpolate_number(from: number, to: number, t: number): number {
  return lerp(from, to, t)
}

export function interpolate_vector2(from: THREE.Vector2, to: THREE.Vector2, t: number): THREE.Vector2 {
  return new THREE.Vector2(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
  )
}

export function interpolate_vector3(from: THREE.Vector3, to: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
    interpolate_number(from.z, to.z, t),
  )
}

export function interpolate_vector4(from: THREE.Vector4, to: THREE.Vector4, t: number): THREE.Vector4 {
  return new THREE.Vector4(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
    interpolate_number(from.z, to.z, t),
    interpolate_number(from.w, to.w, t),
  )
}

export function interpolate_color(from: THREE.Color, to: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    interpolate_number(from.r, to.r, t),
    interpolate_number(from.g, to.g, t),
    interpolate_number(from.b, to.b, t),
  )
}

export function animatePosition(params: {
  obj: THREE.Object3D,
  from?: THREE.Vector3,
  to: THREE.Vector3,
  duration: number,
  ease?: EaseFunction,
  onStart?: () => void,
  onFinish?: () => void
}) {

  if (!params.from) {
    params.from = new THREE.Vector3()
    params.from?.copy(params.obj.position)
  }

  return new Animation<THREE.Vector3>({
    from: params.from,
    to: params.to,
    duration: params.duration,
    interpolate: interpolate_vector3,
    getter: () => { return params.obj.position },
    setter: (new_value: THREE.Vector3) => { params.obj.position.copy(new_value) },
    ease: params.ease,
    onStart: params.onStart,
    onFinish: params.onFinish
  })

}
