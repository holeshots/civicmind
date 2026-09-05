import { useGameState } from '../game/state/GameContext'

export function FoundationOverlay() {
  const { player } = useGameState()
  return (
    <div className="overlay">
      <header className="panel">
        <p className="eyebrow">Browser simulation · Phase 01</p>
        <h1>CivicMind<span> / foundation</span></h1>
        <p>A shared starting point for a living city.</p>
      </header>
      <footer className="panel">
        <p><strong>Gameplay sandbox</strong> · Click game, then WASD · Shift to run · Drag to look</p>
        <p>{player.name} · {player.occupation} · {player.money.toLocaleString('en-US')} game credits</p>
        <p className="muted">Capsule controller active. City and NPCs are not implemented. Reload to reset spawn.</p>
      </footer>
    </div>
  )
}
