import type { ActivityEvent, GameTime, Goal, GoalTask, NPCState, Position } from '../game/types'
import { getNearbyNPCs } from '../game/npc/npcSimulation'

const pesos = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
export const formatCurrency = (money: number) => pesos.format(money)
export function formatGameTime(time: Readonly<GameTime>): string {
  const minute = Math.floor(time.minuteOfDay)
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
}
export function formatActivityTime(atGameMinute: number): string {
  return `Day ${Math.floor(atGameMinute / 1440) + 1} · ${formatGameTime({
    day: 1, minuteOfDay: atGameMinute % 1440, speed: 0, paused: true,
  })}`
}

const ownershipGuidance: readonly Readonly<GoalTask>[] = Object.freeze([
  'Find a source of income', 'Save money', 'Build a good reputation',
  'Explore business opportunities', 'Purchase or start the restaurant',
].map((description, index) => Object.freeze({ id: `ownership-guidance-${index}`, description, completed: false })))
type DisplayGoal = Readonly<Omit<Goal, 'tasks'>> & { readonly tasks: readonly Readonly<GoalTask>[] }
export function getGoalTasks(goal: DisplayGoal): readonly Readonly<GoalTask>[] {
  return goal.tasks.length || goal.id !== 'own-brew-and-bite' || goal.status !== 'active'
    ? goal.tasks : ownershipGuidance
}

export const COMMAND_LIMIT = 500
export function createCommandEvent(text: string, time: Readonly<GameTime>, actorId: string, id: string): ActivityEvent | null {
  const command = text.trim()
  if (!command || command.length > COMMAND_LIMIT) return null
  return { id, atGameMinute: (time.day - 1) * 1440 + time.minuteOfDay,
    kind: 'goal', actorId, message: `Goal command submitted: ${command}` }
}

/** Local session log only. Shared activity is never mutated. Duplicate IDs are ignored. */
export function appendActivity(events: readonly Readonly<ActivityEvent>[], event: Readonly<ActivityEvent>): readonly Readonly<ActivityEvent>[] {
  if (events.some(existing => existing.id === event.id)) return events
  return [...events.slice(-99), { ...event }]
}

export type NearbyNPCSource = Readonly<Pick<NPCState, 'id' | 'name' | 'occupation' | 'position'>>
export function presentNearbyNPCs(npcs: readonly NearbyNPCSource[], position: Readonly<Position>, radius: number) {
  return getNearbyNPCs(npcs, position, radius).map(npc => ({
    id: npc.id, name: npc.name, occupation: npc.occupation,
    distanceLabel: `≈ ${Math.round(Math.hypot(npc.position.x - position.x, npc.position.z - position.z))} m`,
  }))
}

export interface MapBounds { minX: number; maxX: number; minZ: number; maxZ: number }
export function mapPoint(position: Readonly<Position>, bounds: Readonly<MapBounds>) {
  const clamp = (value: number) => Math.max(0, Math.min(100, value))
  return { x: clamp((position.x - bounds.minX) / (bounds.maxX - bounds.minX) * 100),
    y: clamp((position.z - bounds.minZ) / (bounds.maxZ - bounds.minZ) * 100) }
}
