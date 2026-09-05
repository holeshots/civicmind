import { describe, expect, it } from 'vitest'
import { createInitialGameState } from './initialState'

describe('new game', () => {
  it('starts Jed unemployed with the agreed money and ownership goal', () => {
    const state = createInitialGameState()
    expect(state.player).toMatchObject({ name: 'Jed', occupation: 'Unemployed', money: 4200 })
    expect(state.goals[0]).toMatchObject({ title: 'Become the owner of Brew & Bite.', status: 'active' })
    expect(state.time).toEqual({ day: 1, minuteOfDay: 480, speed: 1, paused: true })
  })

  it('isolates mutable nested data between new sessions', () => {
    const first = createInitialGameState()
    const second = createInitialGameState()
    first.player.stats.health = 0
    first.player.position.x = 99
    first.player.inventory.push({ id: 'test', name: 'Test', quantity: 1 })
    first.goals[0]!.tasks.push({ id: 'test', description: 'Test', completed: true })
    expect(second.player.stats.health).toBe(100)
    expect(second.player.position.x).toBe(0)
    expect(second.player.inventory).toEqual([])
    expect(second.goals[0]!.tasks).toEqual([])
  })
})
