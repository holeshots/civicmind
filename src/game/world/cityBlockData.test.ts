import RAPIER from '@dimforge/rapier3d-compat'
import { beforeAll, describe, expect, it } from 'vitest'
import { WORLD_BOUNDS, WORLD_COLLIDERS, WORLD_LANDMARKS } from './cityBlockData'
import { createCharacterMotor } from '../systems/physics/characterMotor'
import { createInitialGameState } from '../state/initialState'

beforeAll(async () => { await RAPIER.init() })

function fixture(x = 0, z = 0, y = 1.2) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
  world.timestep = 1 / 60
  for (const box of WORLD_COLLIDERS) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(...box.halfExtents).setTranslation(...box.position))
  }
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y, z))
  const collider = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), body)
  const motor = createCharacterMotor(world, body, collider)
  world.step()
  const tick = (x = 0, z = 0, count = 60) => {
    for (let i = 0; i < count; i++) { motor.step({ x, z }, world.timestep); world.step() }
  }
  return { world, body, motor, tick }
}

describe('city block collision contract', () => {
  it('starts the actual shared player safely on a pedestrian surface', () => {
    const { x, y, z } = createInitialGameState().player.position
    const f = fixture(x, z, y)
    try {
      f.tick(0, 0, 600)
      expect(f.body.translation().y).toBeCloseTo(1.02, 2)
      expect(f.motor.grounded).toBe(true)
      expect(f.body.translation().x).toBeCloseTo(x, 2)
      expect(f.body.translation().z).toBeCloseTo(z, 2)
    } finally { f.motor.dispose(); f.world.free() }
  })
  it.each([
    ['east', 0, 0, 6, 0, 'x', 31.28],
    ['west', 0, 0, -6, 0, 'x', -31.28],
    ['north', -29, 0, 0, -6, 'z', -27.28],
    ['south', -29, 0, 0, 6, 'z', 27.28],
  ] as const)('blocks the %s perimeter', (_, x, z, vx, vz, axis, edge) => {
    const f = fixture(x, z)
    try {
      f.tick()
      f.tick(vx, vz, 600)
      expect(f.body.translation()[axis]).toBeCloseTo(edge, 1)
      expect(f.motor.grounded).toBe(true)
    } finally { f.motor.dispose(); f.world.free() }
  })

  it.each(WORLD_LANDMARKS)('blocks the closed $name facade', landmark => {
    const { x, z } = landmark.entrance
    const f = fixture(x, z)
    try {
      f.tick()
      const direction = Math.sign(z)
      f.tick(0, direction * 3, 180)
      expect(f.body.translation().z).toBeCloseTo(direction * 9.68, 1)
      expect(f.body.translation().y).toBeCloseTo(1.02, 1)
    } finally { f.motor.dispose(); f.world.free() }
  })

  it('exports the ground footprint for map consumers', () => {
    expect(WORLD_BOUNDS).toEqual({ minX: -32, maxX: 32, minZ: -28, maxZ: 28 })
  })
  it('supports the existing spawn at floor y=0', () => {
    const f = fixture()
    try {
      f.tick(0, 0, 600)
      expect(f.body.translation().y).toBeCloseTo(0.87, 2)
      expect(f.motor.grounded).toBe(true)
    } finally { f.motor.dispose(); f.world.free() }
  })

  it('allows crossing the curb then blocks the restaurant wall', () => {
    const f = fixture()
    try {
      f.tick()
      f.tick(-3, 0, 280)
      f.tick(0, -3, 125)
      expect(f.body.translation().y).toBeCloseTo(1.02, 1)
      expect(f.body.translation().z).toBeLessThan(-5.8)
      f.tick(0, -3, 200)
      expect(f.body.translation().z).toBeGreaterThan(-9.7)
      expect(f.body.translation().z).toBeLessThan(-9.4)
    } finally { f.motor.dispose(); f.world.free() }
  })

  it('contains the player at the road ends', () => {
    const f = fixture()
    try {
      f.tick()
      f.tick(6, 0, 600)
      expect(f.body.translation().x).toBeLessThan(31.6)
      expect(f.body.translation().x).toBeGreaterThan(30)
      expect(f.body.translation().y).toBeGreaterThan(0.8)
    } finally { f.motor.dispose(); f.world.free() }
  })

  it('provides clear approaches to the three destinations', () => {
    expect(WORLD_LANDMARKS.map(landmark => landmark.name)).toEqual(['Brew & Bite', 'Corner Mart', 'Parkside Apartments'])
    for (const landmark of WORLD_LANDMARKS) {
      for (const box of WORLD_COLLIDERS.filter(box => box.kind === 'building' || box.kind === 'prop')) {
        const p = landmark.entrance
        expect(Math.abs(p.x - box.position[0]) < box.halfExtents[0] + 0.35 &&
          Math.abs(p.z - box.position[2]) < box.halfExtents[2] + 0.35).toBe(false)
      }
    }
  })
})
