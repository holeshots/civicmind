import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createInitialGameState } from '../game/state/initialState'
import { ActivityLog, GoalPanel, NearbyNPCPanel, PlayerHUD } from './HudPanels'

describe('HUD renders domain data without WebGL', () => {
  it('renders updated player values and labels hunger as increasing toward starvation', () => {
    const { player } = createInitialGameState()
    player.money = 12345
    player.stats.hunger = 73
    const html = renderToStaticMarkup(createElement(PlayerHUD, { player }))
    expect(html).toContain('₱12,345')
    expect(html).toContain('Jed')
    expect(html).toContain('Unemployed')
    expect(html).toContain('73 / 100; 100 means starving')
    expect(html).toContain('Health')
    expect(html).toContain('Energy')
    expect(html).toContain('Reputation')
  })
  it('renders actual goal tasks without adding fallback objectives', () => {
    const goal = createInitialGameState().goals[0]!
    goal.tasks = [{ id: 'real', description: 'Speak with the owner', completed: true }]
    const html = renderToStaticMarkup(createElement(GoalPanel, { goal }))
    expect(html).toContain('Speak with the owner')
    expect(html).toContain('Completed')
    expect(html).not.toContain('Find a source of income')
  })
  it('shows an honest empty activity state and safely renders event text', () => {
    expect(renderToStaticMarkup(createElement(ActivityLog, { events: [] }))).toContain('No activity yet')
    const html = renderToStaticMarkup(createElement(ActivityLog, { events: [{
      id: 'x', atGameMinute: 1455, kind: 'goal', message: '<script>alert(1)</script>',
    }] }))
    expect(html).toContain('Day 2 · 00:15')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })
  it('renders role and distance, and a useful empty nearby state', () => {
    const html = renderToStaticMarkup(createElement(NearbyNPCPanel, { npcs: [{
      id: 'maria', name: 'Maria', occupation: 'Restaurant Worker', distanceLabel: '≈ 5 m',
    }], radius: 12 }))
    expect(html).toContain('Restaurant Worker')
    expect(html).toContain('≈ 5 m')
    expect(renderToStaticMarkup(createElement(NearbyNPCPanel, { npcs: [], radius: 12 })))
      .toContain('No one within 12 m')
  })
})
