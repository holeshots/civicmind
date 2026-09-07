import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { NPCState } from '../types'
import { NPCCharacter } from './NPCCharacter'
import type { NPCCharacterHandle } from './NPCCharacter'
import { createInitialNPCs, NPC_DEFINITIONS } from './npcData'
import { advanceNPC, createNPCSimulation } from './npcSimulation'
import type { NPCSeed } from './npcSimulation'

export interface NPCPopulationProps {
  /** Spawn-only route-origin seeds. Remount with a new key to reset intentionally. */
  initialNPCs?: readonly NPCSeed[]
  /** Real-time sandbox movement is independent of GameTime; Lead may explicitly freeze it. */
  enabled?: boolean
  /** Detached observations, at most 5 Hz. Does not write GameState or create a store. */
  onSnapshot?: (npcs: NPCState[]) => void
}

export function NPCPopulation({ initialNPCs, enabled = true, onSnapshot }: NPCPopulationProps) {
  const [initial] = useState(() => createNPCSimulation(initialNPCs ?? createInitialNPCs()))
  const actors = useRef(initial)
  const characters = useRef(new Map<string, NPCCharacterHandle>())
  const snapshotElapsed = useRef(0)
  useFrame((_, delta) => {
    // Do not teleport after a hidden tab or a long compilation pause.
    const seconds = Math.min(delta, 0.1)
    if (enabled) {
      actors.current = actors.current.map(actor => {
        const next = advanceNPC(actor, seconds)
        const dx = next.npc.position.x - actor.npc.position.x, dz = next.npc.position.z - actor.npc.position.z
        characters.current.get(actor.npc.id)?.setPose(next.npc.position,
          Math.hypot(dx, dz) > 1e-6 ? Math.atan2(-dx, -dz) : null,
          next.npc.behavior === 'walking', seconds)
        return next
      })
    }
    snapshotElapsed.current += delta
    if (snapshotElapsed.current >= 0.2) {
      snapshotElapsed.current = 0
      onSnapshot?.(structuredClone(actors.current.map(actor => actor.npc)))
    }
  })
  return <group name="npc-population">
    {initial.map(actor => <NPCCharacter key={actor.npc.id}
      definition={NPC_DEFINITIONS.find(definition => definition.id === actor.npc.id)!}
      position={actor.npc.position} ref={handle => {
        if (handle) characters.current.set(actor.npc.id, handle)
        else characters.current.delete(actor.npc.id)
      }} />)}
  </group>
}
