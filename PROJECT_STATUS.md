# PROJECT_STATUS

## Current Phase

Phase 1 browser foundation. Gameplay + Physics — completed/integrated.
World + NPCs — completed/integrated. UI + QA — pending; no HUD workstream implemented.

## Architecture and review

Vite, strict TypeScript, React 19, Three.js, Fiber, Drei and Rapier. Lead's
FoundationScene composes exactly one Canvas and one top-level Physics provider,
with CityBlock, NPCPopulation and the existing Player. The old sandbox floor was
replaced; Player retains sole camera ownership. Lighting/shadow bounds now cover
the neighborhood. No new dependencies or shared-type changes were needed.

Reviewed World source: codex/world-foundation at
63724bd1e0e389c8569c37bb23d4975841856b25, based on Gameplay-integrated main
6aa6deb88bd29bea23c73ba5382db5fddef344ff. Lead integration branch:
codex/world-integration. Independent review found no blocking architectural issue.
Original World changes stayed within world/npc plus documented root/design handoffs.
Lead made necessary composition, initial-state, bounds and documentation changes;
the existing overlay received only a factual status correction. AGENTS.md ownership
rules and Gameplay code remain unchanged.

Domain contracts remain serializable in src/game/types.ts. Read-only GameProvider
contains initial player data and five fresh NPC records. Runtime transforms remain
in refs/Rapier. FoundationScene exposes detached player/NPC snapshot callbacks
(at most 10 Hz / 5 Hz) and existing interaction callbacks for future UI wiring.
No competing store, per-frame React state writes, or generic mutation API was added.
Nested local worktrees are excluded from Git and lint traversal.

## Completed workstreams

- Gameplay: camera-relative WASD, Shift running, acceleration, kinematic capsule,
  gravity, collision, curb stepping, follow/orbit camera and obstruction sweep;
  canvas focus guards; nearest-target/E callback plumbing. Previous floor-sinking
  fix (0.02 m skin and normal gravity accumulation) remains covered at 30/60/120 Hz.
- World: 64 x 56 m procedural city with Brew & Bite, Corner Mart, Parkside Apartments,
  two surrounding buildings, streets, crosswalks, raised sidewalks, plaza, trees,
  benches, lamps and visible perimeter walls. Explicit simple static cuboid colliders.
- NPCs: Maria (Restaurant Worker), Marco (Business Owner), Samantha (Student),
  Officer Reyes (Police Officer), Tito Ramon (Store Owner). Distinct placeholder
  humanoids follow deterministic pedestrian loops with idle stops. Shared NPCState,
  pure route/nearby operations and detached observations. No LLM or external services.
- Repeated static meshes use instancing; one directional shadow light, one fixed
  world body. Five lightweight local NPC updates do not warrant further optimization.

## Coordinates and APIs

Meters, Y up, forward -Z. Ground y=0, sidewalk/plaza y=0.15. Spawn (0,1,0).
Player positions are capsule centers (resting y approximately 0.87 on road, 1.02
on sidewalk); NPC positions are feet. WORLD_BOUNDS is the ground footprint:
X [-32,32], Z [-28,28]. Perimeter inner faces are X +/-31.6, Z +/-27.6.

Landmark entrances: Brew & Bite (-14,0.15,-9), Corner Mart (7,0.15,-9),
Parkside Apartments (-16,0.15,9). Stable IDs and building sizes/centers are exported.
getNearbyNPCs uses inclusive XZ distance, nearest first. See
[exact UI + QA handoff](docs/UI_QA_HANDOFF.md), [world API](src/game/world/README.md)
and [NPC API](src/game/npc/README.md).

## Verification — 2026-09-06

- npm run typecheck: PASS.
- npm run lint: PASS.
- npm run test: PASS, 45 tests in six files.
- npm run build: PASS; existing large-chunk advisory remains.
- git diff --check: PASS. Dependencies unchanged; no reinstall needed for integration.
- Real Rapier tests use the actual city colliders: sustained spawn support, curb
  traversal, all three closed destination facades, all four perimeter edges and
  clear approaches. NPC tests cover isolation, transitions, elapsed-time invariance,
  invalid seeds/time, nearby queries and five minutes of safe routes.
- Integrated browser smoke: city and NPC visuals render; all five named observations
  changed position. Timed existing keyboard-input replay moved the player west to
  x=-14.21, crossed the curb and stopped at the restaurant facade at approximately
  (-14.23,1.0200,-9.6799), grounded. Mouse drag changed the camera perspective.
  No browser console errors in the checked session. Temporary diagnostics removed.
- Independent reviewer also checked 320 deterministic NPC transition/loop cases;
  no blocking findings. Hardware performance portability has not been benchmarked.

## Limitations and next workstream

- UI + QA is next, not started. Existing overlay is temporary. GameState positions
  are initial seeds; live callbacks require explicit App wiring. Activity is empty;
  no event writer, goal completion, economy, clock ticking or command execution.
- Game time stays paused at day 1 08:00; Player and NPC sandbox motion uses real time.
  Jed remains unemployed with 4,200 whole credits; ownership goal is data only.
- NPCs are non-blocking visual placeholders with no avoidance, dialogue, schedules,
  jobs, needs updates, relationships or AI planning. Render/decision separation
  leaves room for those future systems without implementing them.
- Buildings are closed shells; decorative canopies/foliage/trim have no collider.
  Basic camera obstruction follows collision geometry, so decorative clipping and
  tight-space behavior remain future polish. Perimeter contains ordinary walking;
  no teleport/out-of-world recovery or save/resume system.
- All geometry/signage is procedural; no external assets or licenses added.
- Lazy scene bundle is approximately 3.17 MB minified / 1.09 MB gzip; upstream
  Three.Clock/Rapier initialization deprecation warnings remain nonblocking.
- Follow docs/BRANCHING.md: current-main task branches, reviewed PRs, passing checks,
  squash integration by Lead. Branch protection is recommended, not configured.
