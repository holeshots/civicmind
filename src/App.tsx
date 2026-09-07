import { lazy, memo, Suspense } from 'react'
import { GameProvider } from './game/state/GameProvider'
import { GameHUD, useHUDSession } from './ui'
import { SceneBoundary } from './SceneBoundary'

const FoundationScene = memo(lazy(() => import('./game/rendering/FoundationScene')))

export default function App() {
  return <GameProvider><GameView /></GameProvider>
}

function GameView() {
  const session = useHUDSession()
  return <main className="app" aria-label="CivicMind game">
      <SceneBoundary>
        <Suspense fallback={<p className="scene-message" role="status">Loading 3D scene…</p>}>
          <FoundationScene onPlayerSnapshot={session.onPlayerSnapshot} onNPCSnapshot={session.onNPCSnapshot} />
        </Suspense>
      </SceneBoundary>
      <GameHUD {...session} />
    </main>
}
