import { lazy, Suspense } from 'react'
import { GameProvider } from './game/state/GameProvider'
import { FoundationOverlay } from './ui/FoundationOverlay'
import { SceneBoundary } from './SceneBoundary'

const FoundationScene = lazy(() => import('./game/rendering/FoundationScene'))

export default function App() {
  return <GameProvider>
    <main className="app" aria-label="CivicMind foundation sandbox">
      <SceneBoundary>
        <Suspense fallback={<p className="scene-message" role="status">Loading 3D scene…</p>}>
          <FoundationScene />
        </Suspense>
      </SceneBoundary>
      <FoundationOverlay />
    </main>
  </GameProvider>
}
