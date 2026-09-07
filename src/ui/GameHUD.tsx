import { useCallback, useMemo, useState } from 'react'
import { useGameState } from '../game/state/GameContext'
import { ActivityLog, GoalPanel, NearbyNPCPanel, PlayerHUD } from './HudPanels'
import { MiniMap } from './MiniMap'
import { CommandInput } from './CommandInput'
import { DebugPanel } from './DebugPanel'
import { useDebugToggle } from './useDebugToggle'
import { HudDialog, HudNavigation } from './HudNavigation'
import type { HudScreen } from './HudNavigation'
import { formatGameTime, presentNearbyNPCs } from './hudModel'
import type { useHUDSession } from './useHUDSession'
import './hud.css'

export type GameHUDProps = Pick<ReturnType<typeof useHUDSession>, 'playerSnapshot' | 'npcs' | 'events' | 'appendEvent' | 'liveNPCs'>
const nearbyRadius = 12

export function GameHUD({ playerSnapshot, npcs, events, appendEvent, liveNPCs }: GameHUDProps) {
  const state = useGameState()
  const [screen, setScreen] = useState<HudScreen | null>(null)
  const [compact, setCompact] = useState(false)
  const [showObjectives, setShowObjectives] = useState(true)
  const [showMap, setShowMap] = useState(true)
  const debug = useDebugToggle()
  const close = useCallback(() => setScreen(null), [])
  const position = playerSnapshot?.position ?? state.player.position
  const nearby = useMemo(() => presentNearbyNPCs(npcs, position, nearbyRadius), [npcs, position])
  const goal = state.goals.find(item => item.status === 'active')
  const panelContent = () => {
    switch (screen) {
      case 'Map': return <MiniMap position={position} npcs={npcs} expanded />
      case 'Inventory': return <><p className="hud-muted">What you carry</p>{state.player.inventory.length
        ? <ul className="hud-record-list">{state.player.inventory.map(item => <li key={item.id}>{item.name}<strong>× {item.quantity}</strong></li>)}</ul>
        : <div className="hud-placeholder"><span aria-hidden="true">▣</span><h3>Traveling light</h3><p>Your inventory is empty. Item collection is not available in this foundation.</p></div>}</>
      case 'Stats': return <><PlayerHUD player={state.player} /><p className="hud-muted">These are shared character stats. Needs and the economy do not progress yet.</p></>
      case 'Relationships': return <>{state.relationships.filter(relation => relation.fromId === state.player.id).length
        ? <ul className="hud-record-list">{state.relationships.filter(relation => relation.fromId === state.player.id).map(relation =>
          <li key={relation.toId}>{npcs.find(npc => npc.id === relation.toId)?.name ?? relation.toId}<span>Affinity {relation.affinity} / −100…100</span></li>)}</ul>
        : <div className="hud-placeholder"><span aria-hidden="true">♧</span><h3>A city of new faces</h3><p>No relationships recorded. Nearby people are observations; meeting and dialogue are not connected yet.</p></div>}
        <NearbyNPCPanel npcs={nearby} radius={nearbyRadius} /></>
      case 'Goals': return <>{state.goals.length ? state.goals.map(item => <GoalPanel key={item.id} goal={item} />) : <p>No goals yet.</p>}</>
      case 'Log': return <><p className="hud-muted">Shared activity + up to 100 local session events. Commands are submissions only.</p><ActivityLog events={events} /></>
      case 'Settings': return <div className="hud-settings"><h3>Make room for your city</h3>
        <label><input type="checkbox" checked={compact} onChange={event => setCompact(event.target.checked)} /> Compact HUD</label>
        <label><input type="checkbox" checked={showObjectives} onChange={event => setShowObjectives(event.target.checked)} /> Show objective panel</label>
        <label><input type="checkbox" checked={showMap} onChange={event => setShowMap(event.target.checked)} /> Show minimap</label>
        <label><input type="checkbox" checked={debug.visible} onChange={event => debug.setVisible(event.target.checked)} /> Show developer diagnostics</label>
        <p className="hud-muted">Preferences last for this session. Small windows automatically simplify the HUD; every panel remains available below.</p>
        <h3>Controls</h3><p>Click the scene, then WASD to walk · Shift to run · Drag to look.</p>
        <p>Focus a UI control to release movement. Backquote toggles diagnostics outside text entry and dialogs.</p></div>
      default: return null
    }
  }
  return <div className={`game-hud${compact ? ' hud-compact' : ''}`}>
    <div className="hud-topline"><span>CIVIC<span className="hud-mint">MIND</span><small> / a life in the making</small></span><span>PHASE 01 <i aria-hidden="true" /></span></div>
    <div className="hud-left"><PlayerHUD player={state.player} />
      {showObjectives && <div className="hud-goal-card hud-card"><GoalPanel goal={goal} /></div>}
    </div>
    <div className="hud-right"><section className="hud-clock hud-card" aria-label="Game time"><div><span className="hud-kicker">Day {state.time.day}</span><strong>{formatGameTime(state.time)}</strong></div>
      <p><span className="hud-mint">{state.time.paused ? 'Ⅱ Time paused' : 'Time running'}</span><small>Sandbox movement stays active</small></p></section>
      {showMap && <div className="hud-minimap-card hud-card"><MiniMap position={position} npcs={npcs} /></div>}
      <div className="hud-nearby-card hud-card"><NearbyNPCPanel npcs={nearby} radius={nearbyRadius} /></div>
    </div>
    <div className="hud-bottom"><div className="hud-recent"><span className="hud-kicker">Latest activity</span><ActivityLog events={events} compact /></div>
      <CommandInput time={state.time} actorId={state.player.id} onEvent={appendEvent} />
      <HudNavigation active={screen} onSelect={setScreen} />
      <p className="hud-control-hint">Click the city to explore · WASD walk · Shift run · Drag to look</p>
    </div>
    {debug.visible && <DebugPanel snapshot={playerSnapshot} nearbyCount={nearby.length} time={state.time} liveNPCs={liveNPCs} onClose={() => debug.setVisible(false)} />}
    {screen && <HudDialog key={screen} title={screen} onClose={close}>{panelContent()}</HudDialog>}
  </div>
}
