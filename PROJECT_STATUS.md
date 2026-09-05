# PROJECT_STATUS

## Project

CivicMind

## Current Phase

Phase 1 — Browser Game Foundation

## Architecture

Vite + strict TypeScript + React 19. One lazy-loaded React Three Fiber Canvas and
one React Three Rapier Physics provider live in src/game/rendering/. Drei supplies
the sandbox orbit controls. The overlay is ordinary React DOM outside Canvas.

Shared contracts are plain serializable TypeScript in src/game/types.ts: Position,
CharacterStats, PlayerState, NPCState, GameTime, Goal, GoalTask, ActivityEvent,
Relationship, Business, InventoryItem and GameState. Units are documented there.

createInitialGameState() creates independent nested data. Jed starts unemployed
with 4,200 whole game credits, health/energy 100, hunger/reputation 0. The initial
goal is "Become the owner of Brew & Bite." It is data only, with no task evaluation.

React context exposes a read-only initial snapshot. No store package is needed for
a static seed. Future updates should use tested pure domain operations with an
explicit provider action API agreed with Lead. No generic setter or simulation
loop is installed. High-frequency body/camera transforms belong in refs or Rapier,
not React context. Simulation and rendering can therefore evolve independently.

Coordinates: meters, Y-up, forward -Z; floor top y=0. Game time starts paused at
day 1, 08:00; speed is game minutes per real second. The sandbox physics runs
independently to demonstrate the engine integration.

## Completed

- Initialized Vite/React/TypeScript with requested 3D stack and npm lockfile.
- Added shared contracts, initial data factory and read-only React state access.
- Added fixed ground, falling dynamic cube, lighting/shadows and orbit camera.
- Added DOM overlay, lazy scene loading, WebGL fallback and scene error boundary.
- Added ESLint, Node-only Vitest tests and GitHub Actions verification workflow.
- Added ownership folders and GLB/GLTF asset provenance policy.
- Updated README and AGENTS; preserved the original MIT license.

## Active Workstreams

- Lead / Integration: foundation and integration ownership established.
- Gameplay + Physics: ready for handoff; controller not started.
- World + NPCs: ready for handoff; city and NPCs not started.
- UI + QA: ready for handoff; only a temporary foundation overlay exists.

## Agent Ownership

| Workstream | Ownership |
| --- | --- |
| Lead / Integration | package/lockfile/configuration, app entry, global styles, scene boundary, game/types.ts, game/config.ts, game/state/, game/rendering/, root docs |
| Gameplay + Physics | src/game/player/, src/game/systems/physics/ |
| World + NPCs | src/game/world/, src/game/npc/, public/assets/ |
| UI + QA | src/ui/, src/components/, testing expansion coordinated with affected owner |

See AGENTS.md for the full integration contract. Use separate worktrees/branches
from the same committed foundation. Lead mounts workstream exports and integrates
shared changes sequentially. Do not create a second Canvas/Physics provider or
alternative shared types. The gameplay camera must replace sandbox OrbitControls.

## Development Commands

Requirements: Node 22.12+ (24 LTS recommended), npm and desktop WebGL.

| Purpose | Command |
| --- | --- |
| Install | npm ci |
| Development | npm run dev |
| Build | npm run build |
| Test | npm run test |
| Watch tests | npm run test:watch |
| Lint | npm run lint |
| Type checking | npm run typecheck |
| Preview production | npm run preview |

## Verification (2026-09-05)

- npm install: completed, registry audit reported zero vulnerabilities.
- npm run typecheck: passed.
- npm run lint: passed with zero ESLint warnings.
- npm run test: two tests passed, Node environment without React/Three imports.
  Tests cover seed defaults and isolation of nested session data.
- npm run build: passed; bundle-size advisory described below.
- npm run dev -- --host 127.0.0.1: started successfully at port 5173.
- Browser: observed lit cube resting on fixed ground; dragging changed the orbit
  camera view. Overlay correctly shows Jed, occupation and money. No console errors.
- GitHub Actions is configured; a hosted CI run has not been performed locally.

## Known Limitations

- No playable character, city, NPC movement, interactions, economy, clock ticking,
  persistence, goal evaluation, command input, finished HUD, backend or AI yet.
- GLB/GLTF loading is supported by installed Drei/Three, but no asset is included
  or tested yet. Asset licenses/provenance must be recorded before importing assets.
- Shared types express structure and units; they do not validate future external
  input at runtime. Validate save/API boundaries when those are introduced.
- The lazy 3D bundle is about 3.16 MB minified / 1.09 MB gzip, including the physics
  runtime. Vite emits its default 500 kB advisory. This is accepted for the foundation;
  the warning is not suppressed. Profile delivery and split vendor code when adding
  real assets; do not add dependencies to solve a speculative performance issue.
- Fiber 9.7 uses deprecated Three.Clock; Rapier's wrapper initialization emits an
  upstream parameter deprecation. Neither produces an error or stops the scene.
  The app explicitly uses PCFShadowMap to avoid the default soft-shadow deprecation.
  Revisit upstream releases during dependency maintenance; do not patch node_modules.
- Browser smoke is manual; automated rendering/collision/input coverage is future QA.

## Next Tasks

1. **Gameplay + Physics:** Implement and export Player from src/game/player/Player.tsx
   with a capsule collider, WASD movement, Shift running and third-person follow
   camera in the existing Physics world. Test movement calculations independently.
   Prevent input when a DOM text field is focused; verify floor collision and
   frame-rate independence. Coordinate mounting Player and removing OrbitControls
   with Lead. Do not implement world geometry or invent a new player state/store.
2. **World + NPCs:** Implement and export CityBlock from src/game/world/CityBlock.tsx
   using primitive roads, sidewalks and three labeled building shells (Brew & Bite,
   convenience store, apartments), with fixed colliders and an unobstructed player
   spawn. Export NPCPopulation from src/game/npc/NPCPopulation.tsx with five NPCState-
   backed placeholders and simple waypoint movement. Test waypoint logic independently.
   Agree the footprint/spawn with Gameplay; no AI services or custom assets yet.
3. **UI + QA:** Replace FoundationOverlay with a HUD consuming useGameState(): player
   stats, money, current goal, activity-log empty state and nearby-NPC empty state.
   Define a typed command-submit callback with Lead before adding command behavior.
   Add input-focus, accessibility and responsive checks plus useful state/UI tests.
   Do not create another store or implement goal/economy/command simulation.

## Branching strategy

GitHub Flow is documented in docs/BRANCHING.md: stable main, short task branches, isolated worktrees, PR review, passing CI and squash merges. Branch protection is recommended but not configured.
