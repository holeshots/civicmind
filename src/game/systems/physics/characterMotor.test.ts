import RAPIER from '@dimforge/rapier3d-compat'
import { beforeAll, describe, expect, it } from 'vitest'
import { createCharacterMotor } from './characterMotor'

beforeAll(async () => { await RAPIER.init() })
function fixture() {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 })
  world.timestep = 1 / 60
  world.createCollider(RAPIER.ColliderDesc.cuboid(10, 0.25, 10).setTranslation(0, -0.25, 0))
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 3, 0))
  const collider = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), body)
  const motor = createCharacterMotor(world, body, collider)
  const tick = (x = 0, z = 0, count = 1) => {
    for (let i = 0; i < count; i++) { motor.step({ x, z }, world.timestep); world.step() }
  }
  world.step()
  return { world, body, motor, tick }
}
describe('character motor in real Rapier', () => {
  it('falls under gravity and rests on the floor', () => {
    const f = fixture()
    try {
      f.tick(0, 0, 15)
      expect(f.body.translation().y).toBeLessThan(3)
      f.tick(0, 0, 180)
      expect(f.body.translation().y).toBeCloseTo(0.86, 1)
      expect(f.motor.grounded).toBe(true)
    } finally { f.motor.dispose(); f.world.free() }
  })
  it('blocks a running capsule at a wall', () => {
    const f = fixture()
    try {
      f.world.createCollider(RAPIER.ColliderDesc.cuboid(4, 2, 0.1).setTranslation(0, 2, -2))
      f.tick(0, 0, 120)
      f.tick(0, -6, 120)
      expect(f.body.translation().z).toBeGreaterThan(-1.61)
      expect(f.body.translation().z).toBeLessThan(-1.4)
    } finally { f.motor.dispose(); f.world.free() }
  })
  it('steps onto a small curb', () => {
    const f = fixture()
    try {
      f.world.createCollider(RAPIER.ColliderDesc.cuboid(2, 0.1, 2).setTranslation(0, 0.1, -3))
      f.tick(0, 0, 120)
      f.tick(0, -3, 60)
      expect(f.body.translation().z).toBeLessThan(-2.5)
      expect(f.body.translation().y).toBeGreaterThan(1)
      expect(f.body.translation().y).toBeLessThan(1.1)
    } finally { f.motor.dispose(); f.world.free() }
  })
  it('falls when walking beyond ground instead of hovering', () => {
    const f = fixture()
    try {
      f.tick(0, 0, 120)
      f.tick(6, 0, 150)
      expect(f.body.translation().x).toBeGreaterThan(12)
      expect(f.body.translation().y).toBeLessThan(0)
      expect(f.motor.grounded).toBe(false)
    } finally { f.motor.dispose(); f.world.free() }
  })
})
