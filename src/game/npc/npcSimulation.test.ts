import { describe, expect, it } from 'vitest'
import { createInitialNPCs, NPC_DEFINITIONS } from './npcData'
import { advanceNPC, createNPCSimulation, getNearbyNPCs } from './npcSimulation'
import { WORLD_COLLIDERS } from '../world/cityBlockData'
import type { ContextType } from 'react'
import type { GameContext } from '../state/GameContext'
import type { NPCPopulationProps } from './NPCPopulation'

describe('NPC population', () => {
  it('accepts the deeply read-only NPC records exposed by GameContext', () => {
    const npcs: NonNullable<ContextType<typeof GameContext>>['npcs'] = createInitialNPCs()
    const props: NPCPopulationProps = { initialNPCs: npcs }
    expect(createNPCSimulation(props.initialNPCs!).length).toBe(5)
    expect(getNearbyNPCs(npcs, { x: -20, y: 1, z: -6 }, 1)[0].name).toBe('Maria')
  })
  it('creates five complete independent shared-state records', () => {
    const a = createInitialNPCs(), b = createInitialNPCs()
    expect(a.map(npc => npc.name)).toEqual(['Maria', 'Marco', 'Samantha', 'Officer Reyes', 'Tito Ramon'])
    expect(new Set(a.map(npc => npc.id)).size).toBe(5)
    a[0].position.x = 99
    a[0].stats.health = 1
    a[0].inventory.push({ id: 'test', name: 'Test', quantity: 1 })
    expect(b[0].position.x).not.toBe(99)
    expect(b[0].stats.health).toBe(100)
    expect(b[0].inventory).toEqual([])
    expect(b.every(npc => npc.occupation && npc.behavior === 'idle' && npc.destination === null)).toBe(true)
  })

  it('leaves idle, walks at the configured speed, arrives exactly and idles again', () => {
    const start = createNPCSimulation(createInitialNPCs())[0]
    const walking = advanceNPC(start, start.idleRemaining + 1)
    expect(walking.npc.behavior).toBe('walking')
    expect(Math.hypot(walking.npc.position.x - start.npc.position.x,
      walking.npc.position.z - start.npc.position.z)).toBeCloseTo(1)
    const arrival = advanceNPC(start, start.idleRemaining + 10)
    expect(arrival.npc.position).toEqual({ x: -10, y: 0.15, z: -6 })
    expect(arrival.npc.behavior).toBe('idle')
    expect(arrival.npc.destination).toBeNull()
    expect(start.npc.behavior).toBe('idle')
    expect(start.npc.position).toEqual({ x: -20, y: 0.15, z: -6 })
  })

  it('uses elapsed time consistently across frame rates and transitions', () => {
    const start = createNPCSimulation(createInitialNPCs())[0]
    let stepped = start
    for (let i = 0; i < 1800; i++) stepped = advanceNPC(stepped, 1 / 60)
    const single = advanceNPC(start, 30)
    expect(stepped.npc.position.x).toBeCloseTo(single.npc.position.x, 6)
    expect(stepped.npc.position.z).toBeCloseTo(single.npc.position.z, 6)
    expect(stepped.waypointIndex).toBe(single.waypointIndex)
    expect(stepped.idleRemaining).toBeCloseTo(single.idleRemaining, 6)
  })

  it.each([-1, NaN, Infinity])('rejects invalid elapsed seconds %s', seconds => {
    const start = createNPCSimulation(createInitialNPCs())[0]
    expect(() => advanceNPC(start, seconds)).toThrow(RangeError)
  })

  it('freezes at zero seconds and detaches caller-owned state', () => {
    const seeds = createInitialNPCs()
    const runtime = createNPCSimulation(seeds)
    seeds[0].position.x = 100
    expect(runtime[0].npc.position.x).toBe(-20)
    expect(advanceNPC(runtime[0], 0)).toEqual(runtime[0])
  })

  it('rejects duplicate and unknown IDs instead of assigning an unrelated route', () => {
    const seeds = createInitialNPCs()
    expect(() => createNPCSimulation([seeds[0], seeds[0]])).toThrow()
    seeds[0].id = 'unknown'
    expect(() => createNPCSimulation(seeds)).toThrow()
  })

  it('keeps every pedestrian clear of solid props and buildings for five minutes', () => {
    let actors = createNPCSimulation(createInitialNPCs())
    const visited = actors.map(() => new Set<string>())
    for (let step = 0; step < 1200; step++) {
      actors = actors.map((actor, index) => {
        const next = advanceNPC(actor, 0.25), p = next.npc.position
        visited[index].add(`${Math.round(p.x)},${Math.round(p.z)}`)
        expect(Math.abs(p.x)).toBeLessThan(30)
        expect(Math.abs(p.z)).toBeLessThan(26)
        expect(p.y).toBe(0.15)
        for (const box of WORLD_COLLIDERS.filter(box => box.kind !== 'ground' && box.kind !== 'sidewalk')) {
          const inside = Math.abs(p.x - box.position[0]) < box.halfExtents[0] + 0.3 &&
            Math.abs(p.z - box.position[2]) < box.halfExtents[2] + 0.3
          expect(inside, `${next.npc.name} intersects ${box.id}`).toBe(false)
        }
        return next
      })
    }
    expect(visited.every(positions => positions.size > 12)).toBe(true)
    expect(NPC_DEFINITIONS).toHaveLength(5)
  })
})

describe('nearby NPC lookup', () => {
  it('uses inclusive horizontal distance, sorted nearest first, without mutating input', () => {
    const npcs = createInitialNPCs().slice(0, 3)
    npcs[0].position = { x: 3, y: 0.15, z: 4 }
    npcs[1].position = { x: 0, y: 0.15, z: 2 }
    npcs[2].position = { x: 6, y: 0.15, z: 0 }
    const ids = npcs.map(npc => npc.id)
    expect(getNearbyNPCs(npcs, { x: 0, y: 0.87, z: 0 }, 5).map(npc => npc.id)).toEqual([ids[1], ids[0]])
    expect(npcs.map(npc => npc.id)).toEqual(ids)
    expect(getNearbyNPCs([], { x: 0, y: 0, z: 0 }, 5)).toEqual([])
    expect(() => getNearbyNPCs(npcs, { x: 0, y: 0, z: 0 }, -1)).toThrow(RangeError)
  })
})
