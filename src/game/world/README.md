# City block — Lead integration handoff

Implemented on `codex/world-foundation`, from `origin/main` at
`6aa6deb88bd29bea23c73ba5382db5fddef344ff`. Lead has mounted it in FoundationScene on codex/world-integration.

## Exports and mounting

`CityBlock` from `src/game/world` renders one 64 × 56 m procedural neighborhood.
It contains a fixed RigidBody with explicit cuboids; it creates no Canvas, Physics
provider, camera, lighting, HUD or global state. `WORLD_LANDMARKS`, `CITY_BUILDINGS`,
`WORLD_BOUNDS` and `WORLD_COLLIDERS` are also exported as serializable data.

The integrated `FoundationScene.tsx` replaces the 12 × 12 sandbox floor with
`<CityBlock />`, and mounts `<NPCPopulation initialNPCs={npcs} />` beside the existing `<Player />`
inside the existing Physics provider. Retain the existing Suspense boundary.
Do not retain the sandbox floor: its coplanar top would overlap this ground.

```tsx
import { CityBlock } from '../world'
import { NPCPopulation } from '../npc'

// Within Lead's existing Physics tree:
<CityBlock />
<NPCPopulation initialNPCs={npcs} />
<Player player={player} />
```

The current player spawn `(0, 1, 0)` is supported. Keep Player's camera; no
OrbitControls should be added to the integrated scene. World materials accept the
existing lights. For neighborhood-wide shadows, Lead expanded the directional
light shadow camera to approximately ±40 m and position the light around
`(-20, 35, 20)`. QA used ambient intensity 1.2, directional intensity 2.5,
2048 shadow maps, near 0.05, far 200 and DPR capped at 1.5. These demo settings are now applied in Lead-owned scene composition.

## Coordinates

Meters, Y-up, forward -Z. Ground top is y=0; sidewalks/plaza top is y=0.15.
The east-west road occupies z=-4..4. North sidewalk z=-10..-4; south z=4..10.
Crosswalk centers are x=-22, 0 and 22. Plaza spans x=0..20, z=10..24.
Visible perimeter walls prevent walking off the finite ground.

| Landmark | Shell center X,Z | Size W,H,D | Approach X,Y,Z |
| --- | --- | --- | --- |
| Brew & Bite | -14, -15 | 16, 7, 10 | -14, 0.15, -9 |
| Corner Mart | 7, -15 | 14, 4.8, 10 | 7, 0.15, -9 |
| Parkside Apartments | -16, 17 | 18, 15, 14 | -16, 0.15, 9 |

Shell base y=0.15. North buildings face +Z; south buildings face -Z. Two secondary
buildings enclose the block. Approach points sit outside the closed facade and use
stable IDs (`brew-and-bite`, `corner-mart`, `parkside-apartments`). They are landmarks,
not Business ownership records; no economy state is initialized here.

## Collision and performance

The same WORLD_COLLIDERS data drives scene colliders and real Rapier motor tests.
Ground, raised sidewalks, solid building shells, tree planters, benches, lamp posts
and the perimeter block the player. Door handles, window trim, canopies, foliage
and small litter bins are decorative; detailed mesh colliders are deliberately absent.
Doors do not open. Building shells/facades are separate from landmark data so a later
interior can replace a shell and deliberately revise its collider.

Repeated static meshes use instancing with vertex-instance colors. Trees are low-poly,
shop signs are local canvas textures, and only buildings/tree crowns cast world shadows.
Streetlights use emissive faces without six extra shadow lights.

## Files and provenance

- `cityBlockData.ts`: layout, landmarks, collision shapes and prop placements.
- `CityBlock.tsx`: world composition, roads, markings, surfaces and static colliders.
- `Building.tsx`: reusable facade, storefronts, windows, roof trim and canopies.
- `RepeatedMeshes.tsx`, `WorldSign.tsx`, `StreetProps.tsx`: instancing, local signs and props.
- `cityBlockData.test.ts`: actual player motor against the world collision shapes.
- `index.ts`: public exports.

All geometry and signage were authored procedurally for this repository. No external
images, fonts, GLB files or copyrighted commercial assets were imported. No asset
downloads or new package/lockfile changes; public/assets remains unchanged.

See PROJECT_STATUS.md for verification and docs/UI_QA_HANDOFF.md for the next workstream. Building interiors remain future work.
