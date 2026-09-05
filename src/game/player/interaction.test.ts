import { describe, expect, it } from 'vitest'
import { nearestInteractable } from './interaction'
const origin = { x: 0, y: 0, z: 0 }
describe('interaction selection', () => {
  it('selects the nearest enabled target inside a 3D radius', () => {
    const targets = [
      { id: 'far', position: { x: 1.5, y: 0, z: 0 } },
      { id: 'disabled', position: origin, disabled: true },
      { id: 'upstairs', position: { x: 0, y: 3, z: 0 } },
      { id: 'near', position: { x: 0, y: 0, z: 1 } },
    ]
    expect(nearestInteractable(origin, targets, 2)?.id).toBe('near')
  })
  it('includes the radius boundary, excludes out-of-range, and handles empty lists', () => {
    expect(nearestInteractable(origin, [{ id: 'edge', position: { x: 2, y: 0, z: 0 } }], 2)?.id).toBe('edge')
    expect(nearestInteractable(origin, [{ id: 'far', position: { x: 2.01, y: 0, z: 0 } }], 2)).toBeNull()
    expect(nearestInteractable(origin, [], 2)).toBeNull()
  })
  it('resolves equidistant targets by stable id regardless of list order', () => {
    const a = { id: 'a', position: origin }, b = { id: 'b', position: origin }
    expect(nearestInteractable(origin, [b, a], 2)?.id).toBe('a')
    expect(nearestInteractable(origin, [a, b], 2)?.id).toBe('a')
  })
})
