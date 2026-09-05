import { useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
import { Quaternion, Vector3 } from 'three'
import type { Group } from 'three'
import { PLAYER_CONFIG as config } from './playerConfig'
import type { PlayerControls } from './usePlayerControls'

interface ThirdPersonCameraProps {
  body: RefObject<RapierRigidBody | null>
  anchor: RefObject<Group | null>
  controls: RefObject<PlayerControls>
}

export function ThirdPersonCamera({ body, anchor, controls }: ThirdPersonCameraProps) {
  const camera = useThree(state => state.camera)
  const { world, rapier } = useRapier()
  const initialized = useRef(false)
  const distance = useRef<number>(config.cameraDistance)
  const scratch = useMemo(() => ({
    target: new Vector3(), followed: new Vector3(), direction: new Vector3(),
    identity: new Quaternion(), sphere: new rapier.Ball(config.cameraRadius),
  }), [rapier])
  useFrame((_, delta) => {
    if (!body.current || !anchor.current) return
    const dt = Math.min(delta, 0.1)
    // Read the interpolated render transform, not the fixed-step physics transform.
    anchor.current.getWorldPosition(scratch.target)
    scratch.target.setY(scratch.target.y + 0.45)
    if (!initialized.current) {
      scratch.followed.copy(scratch.target)
      initialized.current = true
    } else scratch.followed.lerp(scratch.target, 1 - Math.exp(-config.cameraFollow * dt))
    const { yaw, pitch } = controls.current
    scratch.direction.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    const hit = world.castShape(scratch.followed, scratch.identity, scratch.direction, scratch.sphere,
      0, config.cameraDistance, true, rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined, undefined, body.current)
    const safeDistance = hit ? Math.max(0, hit.time_of_impact - 0.05) : config.cameraDistance
    // Retract immediately; ease outward only, so smoothing cannot carry the camera through a wall.
    distance.current = safeDistance < distance.current ? safeDistance :
      distance.current + (safeDistance - distance.current) * (1 - Math.exp(-8 * dt))
    camera.position.copy(scratch.followed).addScaledVector(scratch.direction, distance.current)
    camera.lookAt(scratch.followed)
  })
  return null
}
