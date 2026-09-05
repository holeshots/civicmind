import { QueryFilterFlags } from '@dimforge/rapier3d-compat'
import type { Collider, RigidBody, World } from '@dimforge/rapier3d-compat'
import type { PlanarVelocity } from '../../player/movement'

/** Owns a Rapier controller; caller must dispose before its World is freed. */
export function createCharacterMotor(world: World, body: RigidBody, collider: Collider) {
  // A 2 cm skin keeps Rapier's ground-snap casts stable on the sandbox floor.
  const controller = world.createCharacterController(0.02)
  controller.enableAutostep(0.3, 0.2, false)
  controller.enableSnapToGround(0.3)
  controller.setMaxSlopeClimbAngle(Math.PI / 4)
  controller.setMinSlopeSlideAngle(Math.PI / 4)
  controller.setSlideEnabled(true)
  let verticalVelocity = 0
  let grounded = false
  const displacement = { x: 0, y: 0, z: 0 }
  const next = { x: 0, y: 0, z: 0 }
  return {
    get grounded() { return grounded },
    step(velocity: PlanarVelocity, dt: number) {
      if (!Number.isFinite(dt) || dt <= 0) return
      // Ground contact clears vertical speed below. Apply one gravity step on the
      // next tick; a forced -1 m/s can make Rapier ground snapping penetrate floors.
      verticalVelocity = Math.max(-50, verticalVelocity + world.gravity.y * dt)
      displacement.x = velocity.x * dt
      displacement.y = verticalVelocity * dt
      displacement.z = velocity.z * dt
      controller.computeColliderMovement(collider, displacement, QueryFilterFlags.EXCLUDE_SENSORS)
      const corrected = controller.computedMovement()
      const position = body.translation()
      next.x = position.x + corrected.x
      next.y = position.y + corrected.y
      next.z = position.z + corrected.z
      body.setNextKinematicTranslation(next)
      grounded = controller.computedGrounded()
      if (grounded) verticalVelocity = 0
    },
    dispose() { world.removeCharacterController(controller) },
  }
}
