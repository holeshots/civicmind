import { describe, expect, it } from 'vitest'
import { movementVelocity, smoothAngle, approachVelocity } from './movement'

describe('camera-relative locomotion', () => {
  it('normalizes diagonal input so it cannot outrun forward movement', () => {
    const diagonal = movementVelocity(1, 1, 0, false)
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(3)
    expect(diagonal.x).toBeGreaterThan(0)
    expect(diagonal.z).toBeLessThan(0)
  })
  it('rotates forward and strafe with camera yaw', () => {
    const forward = movementVelocity(0, 1, Math.PI / 2, false)
    expect(forward.x).toBeCloseTo(-3)
    expect(forward.z).toBeCloseTo(0)
    const right = movementVelocity(1, 0, Math.PI / 2, false)
    expect(right.z).toBeCloseTo(-3)
  })
  it('runs faster, and keeps no-input movement zero even with Shift', () => {
    expect(movementVelocity(0, 1, 0, true).z).toBe(-6)
    expect(Math.hypot(...Object.values(movementVelocity(0, 0, 0, true)))).toBe(0)
  })
  it('accelerates without overshoot and settles at rest', () => {
    const velocity = { x: 0, z: 0 }
    approachVelocity(velocity, { x: 3, z: 0 }, 0.1)
    expect(velocity.x).toBeGreaterThan(0)
    expect(velocity.x).toBeLessThan(3)
    for (let i = 0; i < 120; i++) approachVelocity(velocity, { x: 0, z: 0 }, 1 / 60)
    expect(velocity.x).toBe(0)
  })
  it('produces equivalent smoothing at 30 and 120 Hz', () => {
    const a = { x: 0, z: 0 }, b = { x: 0, z: 0 }
    for (let i = 0; i < 30; i++) approachVelocity(a, { x: 3, z: 0 }, 1 / 30)
    for (let i = 0; i < 120; i++) approachVelocity(b, { x: 3, z: 0 }, 1 / 120)
    expect(a.x).toBeCloseTo(b.x, 8)
  })
  it('turns across the angle seam using the short arc', () => {
    const angle = smoothAngle(Math.PI - 0.1, -Math.PI + 0.1, 0.05)
    expect(angle).toBeGreaterThan(Math.PI - 0.1)
    expect(angle).toBeLessThan(Math.PI + 0.1)
  })
})
