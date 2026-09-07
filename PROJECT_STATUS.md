# PROJECT_STATUS

## Current Phase

**Phase 1 — Complete.** Gameplay + Physics, World + NPCs, UI + QA and final
integration are complete. Phase 2 has not started.

## Final integration — 2026-09-07

Reviewed UI + QA branch `codex/ui-foundation` at
`877352b64c52185ed4248f53ded224ab3c003a92`, based on World-integrated main
`a23f84545384faa80d2be17e4ff512c1617fda6b`. Integration branch:
`codex/phase1-integration`. No merge conflicts. Independent source review found
no blocking defects. App composition and root documentation changes are deliberate
Lead-owned integration edits; no shared contracts or dependencies changed.

Two playability fixes: move the initial player from the road to the south sidewalk
at (0, 1.2, 7), and retain the nearby panel at desktop 720p height. The spawn change
has a real Rapier regression test using the actual shared initial state and city
colliders. Gameplay controller and camera implementation are unchanged.

## Current playable features

- Camera-relative WASD walking, Shift running, acceleration, gravity, kinematic
  capsule, collision/curb stepping and mouse-drag follow camera with obstruction sweep.
- Procedural 64 x 56 m city: Brew & Bite, Corner Mart, Parkside Apartments, two
  surrounding buildings, streets, sidewalks, crosswalks, plaza, trees, benches,
  lamps and perimeter walls. Explicit simple static colliders.
- Five distinct moving NPC placeholders: Maria (Restaurant Worker), Marco (Business
  Owner), Samantha (Student), Officer Reyes (Police Officer), Tito Ramon (Store
  Owner). Deterministic pedestrian loops with idle stops and live nearby observations.
- HUD uses shared Jed / Unemployed / 4,200 whole credits, displayed as ₱4,200;
  health, energy, hunger and reputation; paused day 1, 08:00.
- Ownership goal and five explicitly suggested steps, without invented progress.
- Trimmed 1–500-character command submissions recorded locally as ActivityEvents;
  no AI execution. Empty commands rejected. Bounded log of 100 local events.
- Seven working dialogs: Map, Inventory, Stats, Relationships, Goals, Log, Settings.
  Unimplemented features have explicit empty states. Session HUD preferences work.
- Lightweight SVG minimap uses world footprints, landmarks and live player/NPC
  positions. Nearby people use inclusive 12 m horizontal distance, nearest first.
- Optional diagnostics show sampled browser cadence, player center, movement,
  grounded state, nearby count, paused time and interaction availability.

## Controls and launch

Run `npm ci`, then `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
Open http://127.0.0.1:5173/ in a desktop WebGL browser. Node 22.12+ required.

- Click the city, then WASD to walk; hold Shift to run; drag to orbit the camera.
- Focusing a UI control clears held movement. Click the city to resume control.
- Enter or Submit records a command. Escape closes a dialog and restores focus.
- Backquote toggles diagnostics outside text entry/dialogs. Settings also toggles it.
- E has interaction callback plumbing only; no targets/actions are wired yet.
- Reload resets the sandbox, local commands and display preferences.

## Architecture

One Lead-composed Canvas and one top-level Physics provider mount CityBlock,
NPCPopulation and Player. Player owns the active camera. Domain contracts remain
serializable in `src/game/types.ts`; GameProvider is read-only initial domain state.
Runtime motion stays in refs/Rapier. Detached observations reach the HUD at at most
10 Hz for the player and 5 Hz for NPCs. Stable callbacks and a memoized scene keep
HUD updates from rebuilding scene composition. There are no per-frame React state
writes. Debug cadence updates once per second only while diagnostics are mounted.

`useHUDSession` owns bounded local command history; it merges available shared
activity for display without mutating domain state. This is session UI state, not
a competing simulation store. The five suggested goal steps are labeled fallback
presentation; real shared GoalTask records take precedence. World static meshes
use instancing, one world rigid body and one directional shadow light.

Positions are meters, Y up, forward -Z. Floor top y=0; sidewalk/plaza top y=0.15.
Player positions are capsule centers (resting about 0.87 on road / 1.02 on sidewalk);
NPC positions are feet. Bounds X [-32,32], Z [-28,28]. See the
[world API](src/game/world/README.md), [NPC API](src/game/npc/README.md) and
[UI handoff](docs/UI_FOUNDATION_HANDOFF.md).

## Final verification

- `npm ci`: PASS; no dependency changes.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test`: PASS, 66 tests in eight files.
- `npm run build`: PASS; existing large scene-chunk advisory remains.
- `git diff --check`: PASS.
- Automated coverage includes domain isolation, real Rapier floor/city support,
  curb traversal, all three closed destination facades, all four perimeter edges,
  NPC route invariance/nearby queries and UI formatting/commands/events/rendering.
- Combined browser playtest: walk moved z=7 to 4.08; run moved to -1.75.
  Held W/E while command input was focused left position unchanged at z=-2.61.
  Held W while a modal was focused left position unchanged at z=-3.43; closing
  restored opener focus. Synthetic composing-Enter was suppressed (not a complete
  native IME test). Timed input replay crossed the curb and stopped against Brew
  & Bite at approximately (-14.21,1.02,-9.68), grounded. Temporary QA files removed.
- Mouse drag changed the camera; the world and moving NPC visuals rendered. All
  five distinct live map markers changed position. Nearby names/roles changed with
  proximity. Only one canvas was present in the runtime DOM.
- All seven dialogs opened with correct content and closed on Escape. Goal/steps,
  real shared stats, trimmed command log, empty rejection and minimap settings were
  checked. UI workstream additionally checked overlong rejection and narrow layouts.
  The combined 1280 x 720 layout keeps nearby people visible.
- No console errors in the checked session. Existing Three.Clock and Rapier init
  deprecation warnings remain. Browser FPS is not a hardware performance benchmark.

## Known limitations

Placeholder capsule/player and primitive NPCs; no avoidance, detailed schedules,
needs progression, relationships, dialogue, AI reasoning, economy, business purchase,
command execution or persistent save. Game time remains paused while sandbox motion
continues. Inventory/relationships are empty. Goals are noninteractive. Shared
positions remain seeds; the HUD explicitly consumes live observations.

Buildings are closed shells, without interiors. Decorative trim/foliage use no
colliders; tight-space camera/decorative clipping needs future polish. No teleport
recovery. Assets are procedural; no external asset licenses added. Lazy scene is
about 3.17 MB minified / 1.09 MB gzip. No cross-device performance benchmark.
Branch protection is recommended in docs/BRANCHING.md, not configured by this work.

## Next phase — recommendation only

1. Lead defines tested pure domain actions/events and a versioned save contract;
   Systems + Economy implements one income/expense/needs vertical slice with UI
   progression and persistence. Agree units and ownership before parallel changes.
2. NPC Schedules + Relationships adds one deterministic schedule/interaction loop,
   consuming the same actions/events, with UI reflecting real outcomes.
3. AI Agent + Memory follows stable actions and persistence: bounded commands,
   observable plans/results, failure handling and explicit permitted actions.
4. Assets + Character Visuals can proceed with documented meters/Y-up, licenses and
   simple colliders. Expand the world/interiors only after the small block loop works.

Use current-main isolated task branches, contract PRs first, passing checks and
Lead-reviewed squash merges. No Phase 2 implementation is included.
