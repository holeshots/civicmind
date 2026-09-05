# CivicMind foundation design

Scope: a browser foundation only, as authorized in the project brief. No city,
controller, NPC behavior, economy, AI, or finished HUD.

Use Vite, strict TypeScript, React 19, Fiber 9, Three, Drei and React Three Rapier.
One Canvas and one Physics provider are owned by Lead / Integration. A falling
cube and fixed floor exercise rendering and collision. A DOM overlay remains
outside Canvas. Lazy-load the scene; expose loading and failure messages.

Shared serializable domain contracts live in src/game/types.ts. Fresh initial
state is produced by a pure function. React context exposes the initial snapshot;
future domain actions belong in pure logic, not mesh components. High-frequency
physics transforms stay in refs until deliberately synchronized to snapshots.
Context is sufficient for this seed; a dedicated store or ECS adds premature cost.

Ownership: gameplay owns player and systems/physics, world owns world and npc,
UI owns ui and components. Lead owns composition, state, types and configuration.
Only create folders with a concrete handoff README or implementation.

Coordinates are meters, Y up, forward -Z. Stat ranges and money/time units are
explicit in shared contracts. GLB/GLTF assets go in public/assets with provenance.

Verification: Node-only tests for new-game defaults and independent snapshots;
typecheck, lint, production build, dev-server smoke and browser inspection where
available. Preserve the original license. No deployment required.
