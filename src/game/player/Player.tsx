import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useAfterPhysicsStep, useBeforePhysicsStep, useRapier } from '@react-three/rapier'
import type { RapierCollider, RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import type { EntityId, PlayerState, Position } from '../types'
import { createCharacterMotor } from '../systems/physics/characterMotor'
import { approachVelocity, movementVelocity, smoothAngle } from './movement'
import { nearestInteractable } from './interaction'
import type { Interactable } from './interaction'
import { PLAYER_CONFIG as config } from './playerConfig'
import { PlayerCharacter } from './PlayerCharacter'
import { ThirdPersonCamera } from './ThirdPersonCamera'
import { usePlayerControls } from './usePlayerControls'

/** A detached, serializable runtime observation. Position is capsule CENTER in world meters. */
export interface PlayerSnapshot {
  position: Position
  moving: boolean
  isRunning: boolean
  grounded: boolean
  cameraYaw: number
  interactionTargetId: EntityId | null
}
export interface PlayerProps {
  /** Initial spawn only. Remount with a new key for an intentional reset/teleport. */
  player: Readonly<PlayerState>
  enabled?: boolean
  character?: ReactNode
  interactables?: readonly Interactable[]
  onInteractionTargetChange?: (target: Interactable | null) => void
  onInteract?: (target: Interactable) => void
  /** At most 10 Hz; does not mutate shared GameState. */
  onSnapshot?: (snapshot: PlayerSnapshot) => void
}
const emptyTargets: readonly Interactable[] = []

export function Player({ player, enabled = true, character, interactables = emptyTargets,
  onInteractionTargetChange, onInteract, onSnapshot }: PlayerProps) {
  const body = useRef<RapierRigidBody>(null)
  const collider = useRef<RapierCollider>(null)
  const visual = useRef<Group>(null)
  const anchor = useRef<Group>(null)
  const motor = useRef<ReturnType<typeof createCharacterMotor> | null>(null)
  const { controls, consumeInteraction } = usePlayerControls(enabled)
  const { world } = useRapier()
  const velocity = useRef({ x: 0, z: 0 })
  const desired = useRef({ x: 0, z: 0 })
  const lastPosition = useRef<Position | null>(null)
  const moving = useRef(false)
  const targetId = useRef<EntityId | null | undefined>(undefined)
  const snapshotElapsed = useRef(0)
  // Keep initial body position stable even if Lead publishes observation snapshots.
  const [spawn] = useState<[number, number, number]>(() => [player.position.x, player.position.y, player.position.z])
  useEffect(() => {
    if (!body.current || !collider.current) return
    const instance = createCharacterMotor(world, body.current, collider.current)
    motor.current = instance
    return () => { motor.current = null; instance.dispose() }
  }, [world])
  useBeforePhysicsStep(() => {
    if (!motor.current) return
    const keys = controls.current.keys
    movementVelocity(enabled ? Number(keys.has('KeyD')) - Number(keys.has('KeyA')) : 0,
      enabled ? Number(keys.has('KeyW')) - Number(keys.has('KeyS')) : 0,
      controls.current.yaw, keys.has('ShiftLeft') || keys.has('ShiftRight'), desired.current)
    approachVelocity(velocity.current, desired.current, world.timestep)
    motor.current.step(velocity.current, world.timestep)
  })
  useAfterPhysicsStep(() => {
    if (!body.current) return
    const position = body.current.translation()
    if (lastPosition.current) {
      moving.current = Math.hypot(position.x - lastPosition.current.x, position.z - lastPosition.current.z) / world.timestep > 0.02
    }
    lastPosition.current = position
  })
  useFrame((_, delta) => {
    if (!body.current) return
    if (visual.current && Math.hypot(velocity.current.x, velocity.current.z) > 0.05) {
      visual.current.rotation.y = smoothAngle(visual.current.rotation.y,
        Math.atan2(-velocity.current.x, -velocity.current.z), Math.min(delta, 0.1))
    }
    const position = body.current.translation()

    const target = enabled ? nearestInteractable(position, interactables, config.interactionRadius) : null
    if (targetId.current !== (target?.id ?? null)) {
      targetId.current = target?.id ?? null
      onInteractionTargetChange?.(target)
    }
    if (consumeInteraction()) {
      if (target) onInteract?.(target)
    }
    snapshotElapsed.current += delta
    if (snapshotElapsed.current >= 0.1) {
      snapshotElapsed.current = 0
      onSnapshot?.({
        position: { x: position.x, y: position.y, z: position.z },
        moving: moving.current,
        isRunning: enabled && moving.current && (controls.current.keys.has('ShiftLeft') || controls.current.keys.has('ShiftRight')),
        grounded: motor.current?.grounded ?? false,
        cameraYaw: controls.current.yaw,
        interactionTargetId: target?.id ?? null,
      })
    }
  })
  return (
    <>
      <RigidBody ref={body} type="kinematicPosition" colliders={false} position={spawn}
        enabledRotations={[false, false, false]} name={player.id}>
        <CapsuleCollider ref={collider} args={[config.capsuleHalfHeight, config.capsuleRadius]} />
        <group ref={anchor}>
          <group ref={visual}>{character ?? <PlayerCharacter />}</group>
        </group>
      </RigidBody>
      <ThirdPersonCamera body={body} anchor={anchor} controls={controls} />
    </>
  )
}
