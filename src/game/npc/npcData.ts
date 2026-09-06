import type { EntityId, NPCState, Position } from '../types'

export interface NPCDefinition {
  id: EntityId
  name: string
  occupation: string
  route: readonly Position[]
  speed: number
  idleSeconds: number
  appearance: { shirt: string; trousers: string; skin: string; hair: string; height: number; width: number }
}
const point = (x: number, z: number): Position => ({ x, y: 0.15, z })

/** Feet positions in meters. Speeds are m/s, stops are real sandbox seconds. */
export const NPC_DEFINITIONS: readonly NPCDefinition[] = [
  { id: 'npc-maria', name: 'Maria', occupation: 'Restaurant Worker',
    route: [point(-20, -6), point(-10, -6), point(-10, -8), point(-20, -8)], speed: 1, idleSeconds: 3,
    appearance: { shirt: '#f0d6b1', trousers: '#285e59', skin: '#b97950', hair: '#342b2a', height: 1.62, width: 0.9 } },
  { id: 'npc-marco', name: 'Marco', occupation: 'Business Owner',
    route: [point(-6, -6), point(4, -6), point(4, -8), point(-6, -8)], speed: 0.9, idleSeconds: 4,
    appearance: { shirt: '#556c8a', trousers: '#303e51', skin: '#c38b64', hair: '#2f2929', height: 1.8, width: 1.05 } },
  { id: 'npc-samantha', name: 'Samantha', occupation: 'Student',
    route: [point(5, 6), point(15, 6), point(15, 19), point(5, 19)], speed: 1.2, idleSeconds: 2,
    appearance: { shirt: '#c77755', trousers: '#3d5773', skin: '#d6a079', hair: '#3d2927', height: 1.66, width: 0.85 } },
  { id: 'npc-officer-reyes', name: 'Officer Reyes', occupation: 'Police Officer',
    route: [point(-23, 6), point(-10, 6), point(-10, 8), point(-23, 8)], speed: 1.1, idleSeconds: 3,
    appearance: { shirt: '#354f72', trousers: '#273a55', skin: '#aa714b', hair: '#2a2929', height: 1.82, width: 1.05 } },
  { id: 'npc-tito-ramon', name: 'Tito Ramon', occupation: 'Store Owner',
    route: [point(9, -6), point(17, -6), point(17, -8), point(9, -8)], speed: 0.8, idleSeconds: 4,
    appearance: { shirt: '#7e935d', trousers: '#635448', skin: '#ad7756', hair: '#908d86', height: 1.7, width: 1.15 } },
]

/** Fresh nested data on each call; these can seed GameState.npcs at Lead integration. */
export function createInitialNPCs(): NPCState[] {
  return NPC_DEFINITIONS.map(definition => ({
    id: definition.id, name: definition.name, occupation: definition.occupation, money: 0,
    position: { ...definition.route[0] },
    stats: { health: 100, energy: 100, hunger: 0, reputation: 0 }, inventory: [],
    behavior: 'idle', destination: null,
  }))
}
