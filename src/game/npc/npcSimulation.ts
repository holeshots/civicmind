import type { NPCState, Position } from '../types'
import { NPC_DEFINITIONS } from './npcData'

type Immutable<T> = T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } : T
/** Derived from the shared contract; accepts GameContext's deeply read-only snapshot. */
export type NPCSeed = Immutable<NPCState>

/** Route progress belongs to this sandbox, not a second NPC domain contract. */
export interface NPCRuntime {
  npc: NPCState
  waypointIndex: number
  idleRemaining: number
}

export function createNPCSimulation(npcs: readonly NPCSeed[]): NPCRuntime[] {
  const ids = new Set<string>()
  return npcs.map(npc => {
    const definition = NPC_DEFINITIONS.find(item => item.id === npc.id)
    if (!definition || ids.has(npc.id)) throw new Error(`Unknown or duplicate NPC: ${npc.id}`)
    if (!Object.values(npc.position).every(Number.isFinite)) throw new RangeError('NPC position must be finite')
    // Routes start at their first waypoint; reject arbitrary spawns rather than walking through a building.
    const first = definition.route[0]
    if (Math.hypot(npc.position.x - first.x, npc.position.y - first.y, npc.position.z - first.z) > 0.001) {
      throw new RangeError(`NPC ${npc.id} must start at its route origin`)
    }
    ids.add(npc.id)
    return { npc: { ...npc, position: { ...npc.position }, stats: { ...npc.stats },
      inventory: npc.inventory.map(item => ({ ...item })), behavior: 'idle', destination: null },
      waypointIndex: 1, idleRemaining: definition.idleSeconds }
  })
}

/** Pure operation. Consumes all elapsed time, including arrival/idle transitions. */
export function advanceNPC(runtime: NPCRuntime, seconds: number): NPCRuntime {
  if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Seconds must be finite and nonnegative')
  const definition = NPC_DEFINITIONS.find(item => item.id === runtime.npc.id)
  if (!definition) throw new Error(`Unknown NPC: ${runtime.npc.id}`)
  const npc = { ...runtime.npc, position: { ...runtime.npc.position },
    destination: runtime.npc.destination ? { ...runtime.npc.destination } : null }
  let { waypointIndex, idleRemaining } = runtime
  let remaining = seconds
  // Skip complete loops for large elapsed inputs without unbounded iteration.
  const loopSeconds = definition.route.reduce((sum, p, index) => {
    const next = definition.route[(index + 1) % definition.route.length]
    return sum + Math.hypot(p.x - next.x, p.z - next.z) / definition.speed + definition.idleSeconds
  }, 0)
  remaining %= loopSeconds
  while (remaining > 1e-10) {
    if (idleRemaining > 1e-10) {
      const spent = Math.min(remaining, idleRemaining)
      idleRemaining = Math.max(0, idleRemaining - spent)
      remaining -= spent
      if (idleRemaining > 1e-10) break
    }
    const target = definition.route[waypointIndex]
    const dx = target.x - npc.position.x, dz = target.z - npc.position.z
    const distance = Math.hypot(dx, dz)
    const travelSeconds = distance / definition.speed
    if (remaining + 1e-10 < travelSeconds) {
      const fraction = remaining / travelSeconds
      npc.position.x += dx * fraction
      npc.position.z += dz * fraction
      npc.position.y = target.y
      npc.behavior = 'walking'
      npc.destination = { ...target }
      remaining = 0
    } else {
      npc.position = { ...target }
      npc.behavior = 'idle'
      npc.destination = null
      remaining = Math.max(0, remaining - travelSeconds)
      waypointIndex = (waypointIndex + 1) % definition.route.length
      idleRemaining = definition.idleSeconds
    }
  }
  return { npc, waypointIndex, idleRemaining }
}

/** XZ distance intentionally ignores capsule-center vs feet height. Read-only results. */
export function getNearbyNPCs<T extends Readonly<Pick<NPCState, 'id' | 'position'>>>(
  npcs: readonly T[], position: Readonly<Position>, radius: number,
): T[] {
  if (!Number.isFinite(radius) || radius < 0 || !Object.values(position).every(Number.isFinite)) {
    throw new RangeError('Position and nonnegative radius must be finite')
  }
  return npcs.map(npc => ({ npc, distance: Math.hypot(npc.position.x - position.x, npc.position.z - position.z) }))
    .filter(item => item.distance <= radius)
    .sort((a, b) => a.distance - b.distance || a.npc.id.localeCompare(b.npc.id))
    .map(item => item.npc)
}
