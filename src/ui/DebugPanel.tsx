import { useEffect, useState } from 'react'
import type { GameTime } from '../game/types'
import type { PlayerSnapshot } from '../game/player/Player'
import { formatGameTime } from './hudModel'

export function DebugPanel({ snapshot, nearbyCount, time, liveNPCs, onClose }: {
  snapshot: PlayerSnapshot | null; nearbyCount: number; time: Readonly<GameTime>; liveNPCs: boolean; onClose: () => void
}) {
  const [fps, setFps] = useState<number | null>(null)
  useEffect(() => {
    let request = 0, frames = 0, start = performance.now()
    const sample = (now: number) => {
      frames++
      if (now - start >= 1000) { setFps(Math.round(frames * 1000 / (now - start))); frames = 0; start = now }
      request = requestAnimationFrame(sample)
    }
    request = requestAnimationFrame(sample)
    return () => cancelAnimationFrame(request)
  }, [])
  return <aside className="hud-debug hud-card" aria-label="Developer diagnostics">
    <div className="hud-section-heading"><h2>Developer diagnostics</h2><button type="button" onClick={onClose} aria-label="Close diagnostics">×</button></div>
    <dl><dt>Browser frame cadence</dt><dd>{fps === null ? 'Sampling…' : `${fps} FPS`}</dd>
      <dt>Player XYZ (m, center)</dt><dd>{snapshot ? Object.values(snapshot.position).map(value => value.toFixed(2)).join(', ') : 'Waiting for scene'}</dd>
      <dt>Movement</dt><dd>{snapshot ? `${snapshot.isRunning ? 'Running' : snapshot.moving ? 'Walking' : 'Idle'} · ${snapshot.grounded ? 'grounded' : 'airborne'}` : 'Unavailable'}</dd>
      <dt>Nearby NPCs</dt><dd>{nearbyCount} · {liveNPCs ? 'live observations' : 'initial seeds'}</dd>
      <dt>Game time</dt><dd>Day {time.day} · {formatGameTime(time)} · {time.paused ? 'paused' : 'running'}</dd>
      <dt>Interaction target</dt><dd>{snapshot?.interactionTargetId ?? 'None · targets not wired'}</dd></dl>
    <p className="hud-footnote">Browser cadence, not a GPU benchmark. Player ≤10 Hz · NPCs ≤5 Hz. Backquote toggles this panel.</p>
  </aside>
}
