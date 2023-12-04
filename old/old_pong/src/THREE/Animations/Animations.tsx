import * as THREE from "three"
import { EaseFunction, Ease } from "./Ease"
import { Clock } from './Clock'
import { interpolate_vector3 } from "./interp_functions"

const defaultEaseOvershootOrAmplitude = 1.70158
const defaultEasePeriod = 0

const interpolantTreshold = 0.99999

export class Animation<T>
{
  from: T
  to: T
  duration:number
  interpolate: (from: T, to: T, t: number) => T
  getter?: () => T
  setter: (new_value:T) => void
  ease:EaseFunction
  onStart?: () => void
  onFinish?: () => void
  onUpdate?: (t:number) => void

  current: T

  clock:Clock = new Clock()
  running:boolean = false
  iteration:number = 0

  static running_animations:Animation<any>[] = []

  constructor(params:{
    from: T,
    to: T,
    duration:number,
    interpolate: (from: T, to: T, t: number) => T,
    setter: (new_value:T) => void,
    ease?: EaseFunction,
    onStart?: () => void,
    onFinish?: () => void,
    onUpdate?: (t:number) => void,
  }) {
    this.from = params.from
    this.to = params.to
    this.duration = params.duration
    this.interpolate = params.interpolate
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
    if (!this.running)
    {
      
      if (this.from === this.to) {
        this.finish()
        return
      }
      this.onStart?.()
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
    this.onFinish?.()
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

export function animatePosition( params:{
  obj: THREE.Object3D,
  from?: THREE.Vector3,
  to: THREE.Vector3,
  duration:number,
  ease?: EaseFunction,
  onStart?: () => void,
  onFinish?: () => void
}) {

  if (!params.from) {
    params.from = new THREE.Vector3()
    params.from?.copy(params.obj.position)
  }

  return new Animation<THREE.Vector3>({
    from:params.from,
    to:params.to,
    duration:params.duration,
    interpolate:interpolate_vector3,
    setter: (new_value:THREE.Vector3) => { params.obj.position.copy(new_value) },
    ease:params.ease,
    onStart:params.onStart,
    onFinish:params.onFinish
  })
}

export function animateScale( params:{
  obj: THREE.Object3D,
  from?: THREE.Vector3,
  to: THREE.Vector3,
  duration:number,
  ease?: EaseFunction,
  onStart?: () => void,
  onFinish?: () => void
}) {

  if (!params.from) {
    params.from = new THREE.Vector3()
    params.from.copy(params.obj.scale)
  }

  return new Animation<THREE.Vector3>({
    from:params.from,
    to:params.to,
    duration:params.duration,
    interpolate:interpolate_vector3,
    setter: (new_value:THREE.Vector3) => { params.obj.scale.copy(new_value) },
    ease:params.ease,
    onStart:params.onStart,
    onFinish:params.onFinish
  })
}
