# World + NPC Foundation Implementation Plan

> **For agentic workers:** Execute inline using superpowers:executing-plans; the user authorized continuing autonomously. Steps use checkboxes for tracking.

**Goal:** Deliver a compact city block and five moving NPCs for Lead integration.
**Architecture:** Serializable world/route data drives procedural scene components and simple colliders. Pure NPC operations feed a local ref runtime with optional detached observations.
**Tech Stack:** Existing strict TypeScript, React, Fiber, Drei, Three and Rapier; Vitest.
**Spec:** `docs/superpowers/specs/2026-09-06-world-foundation-design.md`

## Global constraints

- Coordinates in meters, Y up, forward -Z; ground y=0; sidewalk y=0.15.
- Reuse NPCState/Position; no shared contracts/provider/dependency changes.
- One existing Canvas/Physics, composed by Lead. Non-blocking NPC placeholders.
- Real sandbox seconds for movement; enabled=false freezes it; snapshots at most 5 Hz.
- Owned folders plus necessary status and handoff docs only.

## Task 1: World layout and collisions

Files: `src/game/world/cityBlockData.ts`, `cityBlockData.test.ts`, `CityBlock.tsx`,
`Building.tsx`, `StreetProps.tsx`, `RepeatedMeshes.tsx`, `WorldSign.tsx`.
Interfaces: CITY_BUILDINGS, WORLD_COLLIDERS, SIDEWALKS and WORLD_LANDMARKS share the
same meter-based source for rendering, collision and tests; CityBlock takes no props.

- [x] Write failing tests for spawn support, building/prop collision clearance and routes.
- [x] Run `npm run test -- src/game/world/cityBlockData.test.ts` and confirm missing implementation.
- [x] Implement rectangular street/sidewalk layout, landmark shells and perimeter enclosure.
- [x] Implement shared box instancing and local canvas-texture signs; no remote font/assets.
- [x] Run data tests and headless Rapier motor probes against the exported collider data.

## Task 2: NPC state and deterministic navigation

Files: `src/game/npc/npcData.ts`, `npcSimulation.ts`, `npcSimulation.test.ts`,
`NPCCharacter.tsx`, `NPCPopulation.tsx` and `index.ts`.
Interfaces: createInitialNPCs(): NPCState[]; createNPCSimulation(npcs): NPCRuntime[];
advanceNPC(runtime, seconds): NPCRuntime; getNearbyNPCs(npcs, position, radius): NPCState[].
NPCPopulation accepts initialNPCs, enabled and onSnapshot; initial data is spawn-only.

- [x] Test fresh nested state, unique IDs/names, walking/idle transitions, no overshoot,
  elapsed-time invariance, bad timestep rejection, route bounds and horizontal proximity.
- [x] Run targeted tests before implementing.
- [x] Implement pure operations with explicit route cursor/idle state; no competing NPC type.
- [x] Add five varied humanoids and frame-driven local motion; cap visual frame delta at 0.1 s.
- [x] Publish detached snapshots at most 5 Hz and document remount/reset semantics.

## Task 3: Verification and handoff

Files: `src/game/world/README.md`, `src/game/npc/README.md`, `PROJECT_STATUS.md`.

- [x] Run typecheck, lint, all tests and build; fix failures in owned code.
- [x] Temporarily mount CityBlock, NPCPopulation and existing Player in a browser harness.
- [x] Check signs, scale, all five NPCs moving, frame performance, spawn, walls and curbs.
- [x] Remove harness and rerun checks on final deliverables.
- [x] Document exports, exact coordinates, assets, mounting, snapshots, limitations and next task.
- [x] Review diff and preserve finished work on its scoped branch for Lead review.
