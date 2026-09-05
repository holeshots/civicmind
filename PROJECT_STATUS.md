# PROJECT_STATUS

## Project

CivicMind

## Current Phase

Phase 1 — Browser Game Foundation; Gameplay + Physics integrated

## Architecture

Vite, strict TypeScript, React 19, Three.js, Fiber 9, Drei and React Three Rapier.
Lead owns one lazy-loaded Canvas and one top-level Physics provider in
src/game/rendering/FoundationScene.tsx. Player is mounted inside that world;
OrbitControls and the falling demo cube have been removed. The sandbox has an
explicit fixed ground collider. The overlay is React DOM outside Canvas.

Shared serializable contracts remain unchanged in src/game/types.ts. Jed starts
unemployed with 4,200 whole game credits. The initial ownership goal remains data
only. React context exposes a read-only initial snapshot; no new store, generic
setter, AI/backend service or state synchronization loop has been introduced.

The position-based kinematic capsule uses a reusable Rapier motor with fixed-step
movement, gravity, move-and-slide, curb stepping and ground snapping. Player reads
only ID and initial spawn from shared state. Transient input, velocity, physics and
camera state stay in refs. Optional detached snapshots are limited to 10 Hz and
are not currently wired back into GameState. Interaction callbacks use stable IDs
and shared Position/EntityId types; no shared types were duplicated.

Coordinates are meters, Y-up, forward -Z. Player position means capsule center.
The capsule is 1.7 m tall with radius 0.3 m. The motor uses a 0.02 m collision skin;
resting center height above the y=0 floor is approximately 0.87 m. Game time is
still paused at day 1, 08:00; the gameplay sandbox runs independently of that clock.

@dimforge/rapier3d-compat 0.19.2 is now a direct dependency because the motor and
headless tests import it. It matches and deduplicates the runtime used by
@react-three/rapier 2.2.0. Update these together during dependency maintenance.

## Completed

- Browser foundation, shared types/state, toolchain, CI and agent ownership guides.
- Gameplay + Physics: WASD camera-relative movement, Shift running, normalized
  diagonals, smooth acceleration/turning, capsule gravity and collision, curb
  stepping, third-person orbit/follow camera with basic obstruction sweep.
- Canvas-scoped keyboard input with focus, blur, visibility and disabled guards.
- Nearest-target selection and E interaction callback plumbing, with no target
  population or interaction UI implemented yet.
- Integrated Player into the existing scene, removed conflicting camera/cube,
  corrected the overlay controls and read-only Player prop compatibility.
- Fixed reproduced ground penetration: 0.01 m skin plus ground snapping could sink
  an idle capsule through the actual sandbox floor. Use a 0.02 m skin and ordinary
  gravity accumulation instead of forced grounded -1 m/s velocity. Added sustained
  idle and running regressions matching the app floor at 30/60/120 Hz.

## Active Workstreams

- Lead / Integration: gameplay review, fixes and integration completed.
- Gameplay + Physics: initial workstream completed and mounted in the application.
- World + NPCs: not started; no implementation was added during integration.
- UI + QA: pending; the temporary foundation overlay only documents active controls.

## Agent Ownership

| Workstream | Ownership |
| --- | --- |
| Lead / Integration | package/lockfile/configuration, app entry, global styles, scene boundary, game/types.ts, game/config.ts, game/state/, game/rendering/, root docs |
| Gameplay + Physics | src/game/player/, src/game/systems/physics/ |
| World + NPCs | src/game/world/, src/game/npc/, public/assets/ |
| UI + QA | src/ui/, src/components/, testing expansion coordinated with affected owner |

Gameplay changes respected its folders. Lead made the necessary composition,
dependency and overlay integration edits. World/NPC folders, shared types and
shared state implementations were not changed. See AGENTS.md and docs/BRANCHING.md.

## Development Commands

Node 22.12+ (24 LTS recommended), npm and a modern desktop WebGL browser required.

| Purpose | Command |
| --- | --- |
| Install | npm ci |
| Development | npm run dev |
| Type checking | npm run typecheck |
| Lint | npm run lint |
| Test | npm run test |
| Watch tests | npm run test:watch |
| Production build | npm run build |
| Preview production | npm run preview |

## Verification — Gameplay integration, 2026-09-05

- Typecheck, lint, all 21 tests in four files, and production build passed.
- Tests use real Rapier WASM without WebGL for floor/wall/curb/ledge behavior.
  Sustained idle and running tests check clearance every step at 30/60/120 Hz.
- Browser: integrated player and camera render, resting center y=0.8701 after fix.
  Timed DOM keyboard replay covered 2.016 m walking and 4.033 m running over equal
  input windows; moving focus away yielded less than 0.001 m drift. Mouse drag
  changed yaw; no console errors. Temporary runtime diagnostics were removed.
- Independent review plus standalone collision probes confirmed the sinking cause
  and tested the corrected motor. No remaining merge-blocking findings.
- Source inspection confirms one Canvas/Physics provider and no per-frame React
  state updates. CI must pass on the final PR revision before integration to main.

## Known Limitations

- No city, NPCs, backend, AI, economy, goal evaluation, clock ticking, save system,
  animation, jumping, finished HUD or command execution yet.
- Finite sandbox ground has no out-of-world recovery; reload to reset if you walk
  off the edge. World spawn/terrain and recovery policy need later coordination.
- Camera obstruction is basic; tight spaces/slopes/moving platforms need additional
  QA against future world geometry. Interaction selection is proximity-only, with
  no line-of-sight, facing, permission or dialogue system.
- No per-frame shared state writes; GameState.player.position remains the initial
  spawn until an explicit observation/simulation synchronization policy is added.
- The lazy 3D bundle remains about 3.16 MB minified / 1.09 MB gzip. Vite's existing
  size advisory is not suppressed. Upstream Three.Clock/Rapier init deprecations
  remain nonblocking. No external 3D assets have been imported or validated.
- Branch protection is documented as recommended, not configured/enforced.

## Next Tasks

- Gameplay: when world work is authorized, validate spawn, colliders, slopes and
  camera clearance against its geometry; agree recovery and pause policies with
  Lead. Future character animation must preserve the collider/input contracts.
- World + NPCs: await authorization. The planned handoff is CityBlock with roads,
  sidewalks and Brew & Bite/store/apartment shells, followed by five NPC placeholders.
- UI + QA: build state-driven HUD panels and coordinate optional PlayerSnapshot,
  interaction callback and input-focus wiring with Lead. Do not invent a new store.
