import { PLAYER_CONFIG as config } from './playerConfig'
export interface PlanarVelocity { x: number; z: number }

/** yaw=0 looks toward -Z; positive yaw looks toward -X. Optional output avoids allocations. */
export function movementVelocity(right: number, forward: number, yaw: number, running: boolean,
  out: PlanarVelocity = { x: 0, z: 0 }): PlanarVelocity {
  const length = Math.max(1, Math.hypot(right, forward))
  const speed = (running ? config.runSpeed : config.walkSpeed) / length
  out.x = (right * Math.cos(yaw) - forward * Math.sin(yaw)) * speed
  out.z = (-right * Math.sin(yaw) - forward * Math.cos(yaw)) * speed
  return out
}

export function approachVelocity(current: PlanarVelocity, target: PlanarVelocity, dt: number) {
  const rate = target.x === 0 && target.z === 0 ? config.deceleration : config.acceleration
  const alpha = 1 - Math.exp(-rate * Math.max(0, dt))
  current.x += (target.x - current.x) * alpha
  current.z += (target.z - current.z) * alpha
  if (target.x === 0 && target.z === 0 && Math.hypot(current.x, current.z) < 0.001) {
    current.x = 0
    current.z = 0
  }
}

export function smoothAngle(current: number, target: number, dt: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + difference * (1 - Math.exp(-config.turnSpeed * Math.max(0, dt)))
}
