/** Serializable domain data only. No React, Three or Rapier imports. */
export type EntityId = string

/** World meters; Y up, forward -Z. */
export interface Position { x: number; y: number; z: number }

/** All values 0..100. Hunger: 0 = fed, 100 = starving. */
export interface CharacterStats {
  health: number
  energy: number
  hunger: number
  reputation: number
}

export interface InventoryItem { id: EntityId; name: string; quantity: number }

export interface PlayerState {
  id: EntityId
  name: string
  occupation: string
  /** Whole game currency units; no real-world currency assumed. */
  money: number
  position: Position
  stats: CharacterStats
  inventory: InventoryItem[]
}

export interface NPCState extends PlayerState {
  behavior: 'idle' | 'walking' | 'working'
  destination: Position | null
}

/** Day is 1-based; minuteOfDay is [0, 1440). Speed is game minutes/real second. */
export interface GameTime { day: number; minuteOfDay: number; speed: number; paused: boolean }
export interface GoalTask { id: EntityId; description: string; completed: boolean }
export interface Goal {
  id: EntityId
  title: string
  status: 'active' | 'completed' | 'failed'
  tasks: GoalTask[]
}
export interface ActivityEvent {
  id: EntityId
  /** Absolute game minutes since day 1 at midnight. */
  atGameMinute: number
  kind: 'system' | 'interaction' | 'goal' | 'economy'
  message: string
  actorId?: EntityId
}
/** Directed relationship; affinity ranges from -100 to 100. */
export interface Relationship { fromId: EntityId; toId: EntityId; affinity: number }
export interface Business {
  id: EntityId
  name: string
  ownerId: EntityId | null
  position: Position
  /** Whole game currency units. Null means not currently offered for sale. */
  purchasePrice: number | null
}
export interface GameState {
  player: PlayerState
  npcs: NPCState[]
  time: GameTime
  goals: Goal[]
  activity: ActivityEvent[]
  relationships: Relationship[]
  businesses: Business[]
}
