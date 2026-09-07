import { describe, expect, it } from 'vitest'
import { createInitialGameState } from '../game/state/initialState'
import type { ActivityEvent, Goal } from '../game/types'
import { appendActivity, createCommandEvent, formatActivityTime, formatCurrency,
  formatGameTime, getGoalTasks, mapPoint, presentNearbyNPCs } from './hudModel'

describe('HUD presentation contracts', () => {
  it.each([[0, '00:00'], [495, '08:15'], [720, '12:00'], [1439.9, '23:59']])(
    'formats minute %s without rounding into the next day', (minuteOfDay, expected) => {
      expect(formatGameTime({ day: 1, minuteOfDay, speed: 1, paused: true })).toBe(expected)
    })
  it('keeps the day in event timestamps across midnight', () => {
    expect(formatActivityTime(1455)).toBe('Day 2 · 00:15')
  })
  it('presents shared initial credits as whole pesos and initial stats as fed', () => {
    const { player } = createInitialGameState()
    expect(formatCurrency(player.money)).toBe('₱4,200')
    expect(player.stats).toEqual({ health: 100, energy: 100, hunger: 0, reputation: 0 })
    expect(formatCurrency(0)).toBe('₱0')
    expect(formatCurrency(-1200)).toBe('-₱1,200')
  })
  it('provides incomplete guidance only for the initial ownership goal with no tasks', () => {
    const goal = createInitialGameState().goals[0]!
    const tasks = getGoalTasks(goal)
    expect(tasks.map(task => task.description)).toEqual([
      'Find a source of income', 'Save money', 'Build a good reputation',
      'Explore business opportunities', 'Purchase or start the restaurant',
    ])
    expect(tasks.every(task => !task.completed)).toBe(true)
    expect(goal.tasks).toEqual([])
    expect(getGoalTasks({ ...goal, id: 'other' })).toEqual([])
    expect(getGoalTasks({ ...goal, status: 'completed' })).toEqual([])
  })
  it('prefers real goal tasks and preserves completion', () => {
    const goal: Goal = { id: 'own-brew-and-bite', title: 'Own it', status: 'active',
      tasks: [{ id: 'paid', description: 'Earn income', completed: true }] }
    expect(getGoalTasks(goal)).toEqual(goal.tasks)
  })
  it('derives nearest NPC roles using horizontal distance, ignoring capsule height', () => {
    const npcs = createInitialGameState().npcs.slice(0, 2)
    npcs[0]!.position = { x: 3, y: 0.15, z: 4 }
    npcs[1]!.position = { x: 1, y: 0.15, z: 0 }
    const result = presentNearbyNPCs(npcs, { x: 0, y: 99, z: 0 }, 5)
    expect(result.map(npc => [npc.name, npc.distanceLabel])).toEqual([['Marco', '≈ 1 m'], ['Maria', '≈ 5 m']])
    expect(result[1]!.occupation).toBe('Restaurant Worker')
    expect(presentNearbyNPCs(npcs, { x: 0, y: 0, z: 0 }, 0)).toEqual([])
  })
  it('maps north/-Z to the top, and clamps observations outside the footprint', () => {
    const bounds = { minX: -32, maxX: 32, minZ: -28, maxZ: 28 }
    expect(mapPoint({ x: -32, y: 42, z: -28 }, bounds)).toEqual({ x: 0, y: 0 })
    expect(mapPoint({ x: 0, y: 0, z: 0 }, bounds)).toEqual({ x: 50, y: 50 })
    expect(mapPoint({ x: 999, y: 0, z: 28 }, bounds)).toEqual({ x: 100, y: 100 })
  })
})

describe('local command activity', () => {
  const time = { day: 2, minuteOfDay: 15, speed: 1, paused: true }
  it('trims a command and timestamps it in absolute game minutes without executing it', () => {
    expect(createCommandEvent(' Find a job. ', time, 'jed', 'event-1')).toEqual({
      id: 'event-1', atGameMinute: 1455, kind: 'goal', actorId: 'jed',
      message: 'Goal command submitted: Find a job.',
    })
  })
  it.each(['', ' \n\t ', 'a'.repeat(501)])('rejects invalid command text', text => {
    expect(createCommandEvent(text, time, 'jed', 'event-1')).toBeNull()
  })
  it('accepts 500 trimmed characters and treats markup as text', () => {
    expect(createCommandEvent('a'.repeat(500), time, 'jed', 'one')).not.toBeNull()
    expect(createCommandEvent('<script>hello</script>', time, 'jed', 'two')?.message)
      .toBe('Goal command submitted: <script>hello</script>')
  })
  it('appends immutably, deduplicates IDs and retains the latest 100 events', () => {
    const events: ActivityEvent[] = Array.from({ length: 100 }, (_, i) => ({
      id: `e-${i}`, kind: 'system', atGameMinute: i, message: `Event ${i}`,
    }))
    const event = createCommandEvent('Find a job.', time, 'jed', 'next')!
    const next = appendActivity(events, event)
    expect(next).toHaveLength(100)
    expect(next[0]!.id).toBe('e-1')
    expect(next.at(-1)).toEqual(event)
    expect(events[0]!.id).toBe('e-0')
    expect(appendActivity(next, event)).toEqual(next)
    event.message = 'mutated later'
    expect(next.at(-1)!.message).toBe('Goal command submitted: Find a job.')
  })
})
