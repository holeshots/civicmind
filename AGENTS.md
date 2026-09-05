# CivicMind agent guide

CivicMind is an AI-driven browser city simulation. Current scope is the Phase 1
foundation. AI services and full gameplay are future work.

## Stack and commands

TypeScript (strict), Vite, React 19, Three.js, Fiber 9, Drei, React Three Rapier,
ESLint and Vitest. Node 22.12+ (Node 24 LTS recommended), npm, desktop WebGL browser.

- Install reproducibly: `npm ci`
- Develop: `npm run dev`
- Type check: `npm run typecheck`
- Lint: `npm run lint`
- Test once: `npm run test`
- Test interactively: `npm run test:watch`
- Production build: `npm run build`
- Serve production build: `npm run preview`

## Ownership

| Owner | Primary files/folders |
| --- | --- |
| Lead / Integration | package files, configuration, src/App.tsx, src/main.tsx, src/styles.css, src/SceneBoundary.tsx, src/game/types.ts, src/game/config.ts, src/game/state/, src/game/rendering/, root docs |
| Gameplay + Physics | src/game/player/, src/game/systems/physics/ |
| World + NPCs | src/game/world/, src/game/npc/, public/assets/ |
| UI + QA | src/ui/, src/components/, colocated tests (coordinate cross-owner changes) |

Search existing code before creating systems. Do not duplicate shared types.
Avoid changing another owner's area unless necessary; explain cross-owner edits.
Do not silently rewrite working architecture. Avoid large dependencies without
clear justification; dependency/lockfile changes belong to Lead / Integration.

## Contracts and conventions

- Domain state is serializable plain TypeScript, with no rendering dependencies.
- Import domain contracts from src/game/types.ts using type-only imports.
- Positions are meters, Y up, forward -Z. Floor top is y=0.
- Stats are 0..100; hunger grows toward starvation. Money uses whole game credits.
- Day is 1-based; minuteOfDay is [0,1440); speed is game minutes per real second.
- Initial simulation time is paused. Rapier sandbox motion is independent of time.
- Treat useGameState() as read-only. New mutations must be explicit pure domain
  operations, tested independently, then exposed through an agreed provider API.
- Do not update React context every animation frame. Keep transient transforms in
  refs/Rapier; agree snapshot synchronization with Lead before adding it.
- One Canvas and one Physics provider, both composed by Lead. Workstreams export
  components for that existing scene. Do not nest another Canvas or Physics world.
- Gameplay will own the active camera; remove sandbox OrbitControls at integration.
- Use named exports except lazy scene/App entry points, PascalCase components,
  camelCase functions, and colocated *.test.ts tests. Keep modules focused.
- GLB is preferred, GLTF supported through Drei useGLTF. Assets use meters/Y-up;
  document license/source and use explicit simple colliders, not visual mesh detail.

## Integration and verification

Use separate branches/worktrees per workstream, e.g. codex/gameplay-foundation,
codex/world-foundation, codex/ui-foundation. Start from the same committed foundation.
Do not share one mutable checkout between concurrent agents. Lead integrates one
workstream at a time and resolves edits to composition/shared contracts.

Before extending shared types, find consumers, propose/document the exact contract
change and its units, then update consumers and tests together. No parallel copies.
Document necessary shared edits in the handoff so Lead can integrate them deliberately.

Before completing work run typecheck, lint, tests and build. Test meaningful domain
behavior without WebGL; rendering, camera, collision and input changes also need a
browser smoke check. Report commands, results and any limits. Keep PROJECT_STATUS.md
accurate; never claim planned features work. PRs/handoffs state exports to mount,
shared changes, asset provenance, verification and remaining integration work.

Follow [docs/BRANCHING.md](docs/BRANCHING.md): short task branches from current main, isolated worktrees, reviewed PRs with passing checks, and squash merges coordinated by Lead.
