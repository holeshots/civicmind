# CivicMind

CivicMind is a planned AI-driven 3D browser city simulation. The current app is a
gameplay sandbox: a capsule player, physics ground, third-person camera and React
overlay. WASD movement, running and collisions work; city, NPCs and AI are future work.

## Run locally

Requires Node.js 22.12+ (24 LTS recommended), npm and a modern desktop browser with
WebGL/hardware acceleration.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Click the game, use WASD to move and Shift to
run, and drag to orbit the follow camera. Reload to reset if you leave the ground.

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

`npm run test:watch` starts interactive tests. Production output is in `dist/`.

## Architecture

- `src/game/types.ts`: shared, serializable domain contracts.
- `src/game/state/`: fresh initial state and read-only React context.
- `src/game/rendering/`: one Canvas/Physics composition and smoke scene.
- `src/game/player/`, `src/game/systems/physics/`: gameplay ownership.
- `src/game/world/`, `src/game/npc/`: world/NPC ownership.
- `src/ui/`, `src/components/`: DOM interface ownership.
- `public/assets/`: future GLB/GLTF assets and provenance.

Stack: TypeScript, Vite, React, Three.js, React Three Fiber, Drei, Rapier, ESLint,
Vitest. No backend, AI credentials or external asset service is required.

See [AGENTS.md](AGENTS.md) for contracts and integration rules, and
[PROJECT_STATUS.md](PROJECT_STATUS.md) for handoffs and limitations.

Future contributions follow [our branching strategy](docs/BRANCHING.md).
