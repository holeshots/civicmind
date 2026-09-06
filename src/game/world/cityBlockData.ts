import type { EntityId, Position } from '../types'

export type Vector3Tuple = [number, number, number]
export interface WorldBox {
  id: string
  kind: 'ground' | 'sidewalk' | 'building' | 'prop' | 'boundary'
  position: Vector3Tuple
  halfExtents: Vector3Tuple
}
export interface CityBuilding {
  id: EntityId
  name: string
  center: Vector3Tuple
  size: Vector3Tuple
  color: string
  accent: string
  floors: number
  facing: 0 | 180
  landmark: boolean
}

export const CITY_BUILDINGS: readonly CityBuilding[] = [
  { id: 'brew-and-bite', name: 'Brew & Bite', center: [-14, 0.15, -15], size: [16, 7, 10], color: '#c77d5b', accent: '#235b57', floors: 2, facing: 0, landmark: true },
  { id: 'corner-mart', name: 'Corner Mart', center: [7, 0.15, -15], size: [14, 4.8, 10], color: '#e3d8bc', accent: '#427768', floors: 1, facing: 0, landmark: true },
  { id: 'north-offices', name: 'CIVIC STUDIOS', center: [24, 0.15, -17], size: [10, 11, 14], color: '#91a2a3', accent: '#46596b', floors: 3, facing: 0, landmark: false },
  { id: 'parkside-apartments', name: 'Parkside Apartments', center: [-16, 0.15, 17], size: [18, 15, 14], color: '#c3ba9d', accent: '#455e6e', floors: 5, facing: 180, landmark: true },
  { id: 'south-workshops', name: 'THE WORKSHOP', center: [25, 0.15, 21], size: [10, 8, 10], color: '#af968b', accent: '#554e60', floors: 2, facing: 180, landmark: false },
]

export const WORLD_LANDMARKS: readonly { id: EntityId; name: string; entrance: Position }[] =
  CITY_BUILDINGS.filter(building => building.landmark).map(building => ({
    id: building.id, name: building.name,
    entrance: { x: building.center[0], y: 0.15,
      z: building.center[2] + (building.facing === 0 ? 1 : -1) * (building.size[2] / 2 + 1) },
  }))

export const SIDEWALKS: readonly WorldBox[] = [
  { id: 'north-walk', kind: 'sidewalk', position: [0, 0.075, -7], halfExtents: [31, 0.075, 3] },
  { id: 'south-walk', kind: 'sidewalk', position: [0, 0.075, 7], halfExtents: [31, 0.075, 3] },
  { id: 'plaza', kind: 'sidewalk', position: [10, 0.075, 17], halfExtents: [10, 0.075, 7] },
]

export const TREE_POSITIONS: readonly Vector3Tuple[] = [
  [-28, 0.15, -8], [-25, 0.15, 8], [19, 0.15, -8], [28, 0.15, 7],
  [2, 0.15, 13], [19, 0.15, 13], [2, 0.15, 22], [18, 0.15, 22],
]
export const BENCH_POSITIONS: readonly Vector3Tuple[] = [[-4, 0.15, 8.8], [9, 0.15, 22], [13, 0.15, 22]]
export const LIGHT_POSITIONS: readonly Vector3Tuple[] = [
  [-26, 0.15, -4.6], [-4, 0.15, -4.6], [20, 0.15, -4.6],
  [-26, 0.15, 4.6], [4, 0.15, 4.6], [24, 0.15, 4.6],
]

/** Rendering and headless motor tests consume these same simple collision shapes. */
export const WORLD_COLLIDERS: readonly WorldBox[] = [
  { id: 'ground', kind: 'ground', position: [0, -0.25, 0], halfExtents: [32, 0.25, 28] },
  ...SIDEWALKS,
  ...CITY_BUILDINGS.map((building): WorldBox => ({ id: building.id, kind: 'building',
    position: [building.center[0], building.center[1] + building.size[1] / 2, building.center[2]],
    halfExtents: [building.size[0] / 2, building.size[1] / 2, building.size[2] / 2] })),
  ...TREE_POSITIONS.map(([x, y, z], index): WorldBox => ({ id: `tree-${index}`, kind: 'prop',
    position: [x, y + 0.4, z], halfExtents: [0.7, 0.4, 0.7] })),
  ...BENCH_POSITIONS.map(([x, y, z], index): WorldBox => ({ id: `bench-${index}`, kind: 'prop',
    position: [x, y + 0.5, z], halfExtents: [1.2, 0.5, 0.4] })),
  ...LIGHT_POSITIONS.map(([x, y, z], index): WorldBox => ({ id: `light-${index}`, kind: 'prop',
    position: [x, y + 2.6, z], halfExtents: [0.13, 2.6, 0.13] })),
  { id: 'west-boundary', kind: 'boundary', position: [-31.8, 1, 0], halfExtents: [0.2, 1, 28] },
  { id: 'east-boundary', kind: 'boundary', position: [31.8, 1, 0], halfExtents: [0.2, 1, 28] },
  { id: 'north-boundary', kind: 'boundary', position: [0, 1, -27.8], halfExtents: [32, 1, 0.2] },
  { id: 'south-boundary', kind: 'boundary', position: [0, 1, 27.8], halfExtents: [32, 1, 0.2] },
]

/** Ground footprint in meters (XZ); perimeter walls occupy the outer 0.4 m. */
const ground = WORLD_COLLIDERS.find(box => box.kind === 'ground')!
export const WORLD_BOUNDS = Object.freeze({
  minX: ground.position[0] - ground.halfExtents[0],
  maxX: ground.position[0] + ground.halfExtents[0],
  minZ: ground.position[2] - ground.halfExtents[2],
  maxZ: ground.position[2] + ground.halfExtents[2],
})
