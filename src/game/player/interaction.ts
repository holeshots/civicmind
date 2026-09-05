import type { EntityId, Position } from '../types'

/** Serializable adapter for an NPC, door or object. Position is the interaction anchor in meters. */
export interface Interactable {
  id: EntityId
  position: Position
  label?: string
  disabled?: boolean
}

export function nearestInteractable(position: Position, targets: readonly Interactable[], radius: number): Interactable | null {
  if (!Number.isFinite(radius) || radius < 0) return null
  let nearest: Interactable | null = null
  let distanceSquared = radius * radius
  for (const target of targets) {
    if (target.disabled) continue
    const distance = (position.x - target.position.x) ** 2 +
      (position.y - target.position.y) ** 2 + (position.z - target.position.z) ** 2
    if (distance < distanceSquared || (distance === distanceSquared && (!nearest || target.id < nearest.id))) {
      nearest = target
      distanceSquared = distance
    }
  }
  return nearest
}
