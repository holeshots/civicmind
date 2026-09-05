# CivicMind Foundation Implementation Plan

**Goal:** Establish a minimal browser scene and shared contracts for three agents.
**Architecture:** Pure domain data, React context, one render/physics composition.
**Tech Stack:** TypeScript, Vite, React, Three, Fiber, Drei, Rapier, ESLint, Vitest.
**Spec:** ../specs/2026-09-05-foundation-design.md

## Tasks

- [x] Configure package scripts, strict tsconfig, ESLint and Node-based Vitest.
- [x] Write initial-state tests, observe failure, implement shared types and factory.
- [x] Compose context, lazy Canvas, lights, fixed ground, falling cube and overlay.
- [x] Document ownership, units, asset policy and exact next workstream tasks.
- [x] Install and verify typecheck, lint, tests, build and development application.

## File boundaries

src/game/types.ts defines serializable contracts; src/game/state/initialState.ts
exports createInitialGameState(); src/game/state/GameProvider.tsx creates one
snapshot per mount; src/game/rendering/FoundationScene.tsx owns the smoke scene.
src/App.tsx wires them together. README.md, AGENTS.md and PROJECT_STATUS.md
are the handoff. src/game/state/initialState.test.ts asserts initial player
values and nested snapshot independence without importing React or Three.

## Acceptance checks

Run npm run test before implementing the missing factory, then run it again after
implementation. Run npm run typecheck, npm run lint, npm run test, npm run build.
Start npm run dev -- --host 127.0.0.1 and inspect the rendered physics scene.
Confirm future agents need neither another Canvas nor another shared type file.

