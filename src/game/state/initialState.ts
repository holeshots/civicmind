import type { GameState } from '../types'

/** Each call owns its nested data; safe for independent sessions and resets. */
export function createInitialGameState(): GameState {
  return {
    player: {
      id: 'player-jed', name: 'Jed', occupation: 'Unemployed', money: 4200,
      position: { x: 0, y: 1, z: 0 },
      stats: { health: 100, energy: 100, hunger: 0, reputation: 0 },
      inventory: [],
    },
    npcs: [],
    time: { day: 1, minuteOfDay: 480, speed: 1, paused: true },
    goals: [{ id: 'own-brew-and-bite', title: 'Become the owner of Brew & Bite.', status: 'active', tasks: [] }],
    activity: [], relationships: [], businesses: [],
  }
}
