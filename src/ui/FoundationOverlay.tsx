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
        <p><strong>Physics sandbox</strong> · Drag to orbit · Scroll to zoom</p>
        <p>{player.name} · {player.occupation} · {player.money.toLocaleString('en-US')} game credits</p>
        <p className="muted">Placeholder scene. Gameplay and simulation are not active yet.</p>
      </footer>
    </div>
  )
}
