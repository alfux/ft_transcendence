import * as THREE from 'three'
import { lerp } from "three/src/math/MathUtils"

export function interpolate_number(from: number, to: number, t: number): number
{
  return lerp(from, to, t)
}

export function interpolate_vector2(from: THREE.Vector2, to: THREE.Vector2, t: number): THREE.Vector2
{
  return new THREE.Vector2(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
  )
}

export function interpolate_vector3(from: THREE.Vector3, to: THREE.Vector3, t: number): THREE.Vector3
{
  return new THREE.Vector3(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
    interpolate_number(from.z, to.z, t),
  )
}

export function interpolate_vector4(from: THREE.Vector4, to: THREE.Vector4, t: number): THREE.Vector4
{
  return new THREE.Vector4(
    interpolate_number(from.x, to.x, t),
    interpolate_number(from.y, to.y, t),
    interpolate_number(from.z, to.z, t),
    interpolate_number(from.w, to.w, t),
  )
}

export function interpolate_color(from: THREE.Color, to: THREE.Color, t: number): THREE.Color
{
  return new THREE.Color(
    interpolate_number(from.r, to.r, t),
    interpolate_number(from.g, to.g, t),
    interpolate_number(from.b, to.b, t),
  )
}