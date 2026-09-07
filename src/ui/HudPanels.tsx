import { memo } from 'react'
import type { ActivityEvent, Goal, PlayerState } from '../game/types'
import { formatActivityTime, formatCurrency, getGoalTasks } from './hudModel'
import type { presentNearbyNPCs } from './hudModel'

type DisplayPlayer = Readonly<Pick<PlayerState, 'name' | 'occupation' | 'money' | 'stats'>>
export const PlayerHUD = memo(function PlayerHUD({ player }: { player: DisplayPlayer }) {
  return <section className="hud-card hud-player" aria-label="Player status">
    <div className="hud-identity"><span className="hud-avatar" aria-hidden="true">{player.name.slice(0, 1)}</span>
      <div><h1>{player.name}</h1><p className="hud-muted">{player.occupation}</p></div>
      <div className="hud-wallet"><span className="hud-kicker">Wallet</span><strong>{formatCurrency(player.money)}</strong></div>
    </div>
    <div className="hud-stats">{(['health', 'energy', 'hunger', 'reputation'] as const).map(stat => {
      const value = player.stats[stat]
      const label = stat[0].toUpperCase() + stat.slice(1)
      return <div className={`hud-stat hud-stat-${stat}`} key={stat}>
        <div><span>{label}</span><span>{value}<small> / 100</small></span></div>
        <meter min={0} max={100} value={value} aria-label={label}
          aria-valuetext={`${value} / 100${stat === 'hunger' ? '; 100 means starving' : ''}`} />
      </div>
    })}</div>
    <p className="hud-footnote">Hunger: 0 is fed · 100 is starving</p>
  </section>
})

type DisplayGoal = Readonly<Omit<Goal, 'tasks'>> & { readonly tasks: readonly Readonly<Goal['tasks'][number]>[] }
export const GoalPanel = memo(function GoalPanel({ goal }: { goal?: DisplayGoal }) {
  if (!goal) return <p className="hud-empty">No active objective.</p>
  const tasks = getGoalTasks(goal)
  const guidance = tasks.length > 0 && goal.tasks.length === 0
  return <section className="hud-objective" aria-label="Current goal">
    <p className="hud-kicker">{goal.status === 'active' ? 'Your next chapter' : goal.status}</p>
    <h2>{goal.title}</h2>
    <ol className="hud-objective-steps">{tasks.map((task, index) => <li key={task.id} className={task.completed ? 'is-complete' : ''}>
      <span className="hud-step-mark" aria-hidden="true">{task.completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
      <span>{task.completed && <span className="hud-sr-only">Completed: </span>}{task.description}</span>
    </li>)}</ol>
    {guidance && <p className="hud-footnote">Suggested path · progress tracking coming later</p>}
  </section>
})

export const ActivityLog = memo(function ActivityLog({ events, compact = false }: {
  events: readonly Readonly<ActivityEvent>[]; compact?: boolean
}) {
  const visible = (compact ? events.slice(-2) : [...events]).reverse()
  return <section className="hud-activity" aria-label="Activity log">
    {visible.length === 0 ? <p className="hud-empty">No activity yet. Your story starts here.</p>
      : <ol>{visible.map(event => <li key={event.id}><time>{formatActivityTime(event.atGameMinute)}</time>
        <p>{event.message}</p></li>)}</ol>}
  </section>
})

export function NearbyNPCPanel({ npcs, radius }: { npcs: ReturnType<typeof presentNearbyNPCs>; radius: number }) {
  return <section className="hud-nearby" aria-label="Nearby people">
    <div className="hud-section-heading"><h2>In your neighborhood</h2><span>{npcs.length}</span></div>
    <p className="hud-footnote">Within {radius} m · horizontal distance</p>
    {npcs.length === 0 ? <p className="hud-empty">No one within {radius} m. Explore the block.</p>
      : <ul>{npcs.map(npc => <li key={npc.id}><span className="hud-person-dot" aria-hidden="true" />
        <div><strong>{npc.name}</strong><span className="hud-muted">{npc.occupation}</span></div>
        <span className="hud-distance">{npc.distanceLabel}</span>
      </li>)}</ul>}
  </section>
}
