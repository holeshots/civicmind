import { CITY_BUILDINGS, WORLD_BOUNDS, WORLD_LANDMARKS } from '../game/world/cityBlockData'
import type { Position } from '../game/types'
import { mapPoint } from './hudModel'
import type { NearbyNPCSource } from './hudModel'

export function MiniMap({ position, npcs, expanded = false }: {
  position: Readonly<Position>; npcs: readonly NearbyNPCSource[]; expanded?: boolean
}) {
  const player = mapPoint(position, WORLD_BOUNDS)
  const aspect = (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX)
  return <section className={`hud-map ${expanded ? 'hud-map-expanded' : ''}`} aria-label="Neighborhood map">
    <div className="hud-section-heading"><h2>Downtown</h2><span aria-label="North is up">N ↑</span></div>
    <svg viewBox={`0 0 100 ${100 * aspect}`} role="img" aria-label="Schematic neighborhood map. North is up; gold is you, green dots are people, numbered diamonds are destinations.">
      <rect width="100" height={100 * aspect} rx="2" fill="#243435" />
      <path d={`M 0 ${50 * aspect} H 100`} stroke="#364b4b" strokeWidth="9" />
      <path d={`M 0 ${50 * aspect} H 100`} stroke="#8ca19a" strokeWidth="0.3" strokeDasharray="2 2" />
      {CITY_BUILDINGS.map(building => {
        const corner = mapPoint({ x: building.center[0] - building.size[0] / 2, y: 0,
          z: building.center[2] - building.size[2] / 2 }, WORLD_BOUNDS)
        return <rect key={building.id} x={corner.x} y={corner.y * aspect}
          width={building.size[0] / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) * 100}
          height={building.size[2] / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) * 100}
          rx="1" fill={building.landmark ? '#63746a' : '#415453'} stroke="#93a28b" strokeWidth="0.35">
          <title>{building.name}</title></rect>
      })}
      {WORLD_LANDMARKS.map((landmark, index) => {
        const point = mapPoint(landmark.entrance, WORLD_BOUNDS)
        return <g key={landmark.id} transform={`translate(${point.x} ${point.y * aspect})`}>
          <rect x="-2.8" y="-2.8" width="5.6" height="5.6" rx="1" fill="#f5cf86" transform="rotate(45)" />
          <text textAnchor="middle" dy="1.4" fill="#152121" fontSize="4" fontWeight="700">{index + 1}</text>
          <title>{landmark.name}</title></g>
      })}
      {npcs.map(npc => {
        const point = mapPoint(npc.position, WORLD_BOUNDS)
        return <circle key={npc.id} cx={point.x} cy={point.y * aspect} r="1.3" fill="#95e8c4" stroke="#173e34" strokeWidth="0.5"><title>{npc.name}</title></circle>
      })}
      <circle cx={player.x} cy={player.y * aspect} r="3.2" fill="#efbd6b" opacity="0.25" />
      <circle cx={player.x} cy={player.y * aspect} r="1.7" fill="#ffe5a8" stroke="#172627" strokeWidth="0.6"><title>Your position</title></circle>
    </svg>
    {expanded ? <><ul className="hud-map-legend">{WORLD_LANDMARKS.map((landmark, index) =>
      <li key={landmark.id}><span>{index + 1}</span>{landmark.name}</li>)}</ul>
      <p className="hud-muted">Gold: you · Green: people · Building interiors are closed.</p></>
      : <p className="hud-footnote">● You · <span className="hud-mint">● People</span> · 1 Brew &amp; Bite</p>}
  </section>
}
