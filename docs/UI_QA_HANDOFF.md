# UI + QA handoff

This document records the pre-UI integration baseline. For the implemented HUD,
App wiring and current QA evidence, see [UI foundation handoff](UI_FOUNDATION_HANDOFF.md).

World + NPCs and Gameplay + Physics are integrated. This document prepares the next
workstream; it does not authorize or implement UI features. Start a fresh scoped
branch/worktree from fetched origin/main and follow AGENTS.md and docs/BRANCHING.md.
Own src/ui/ and src/components/; coordinate App/scene/shared-state edits with Lead.

## Shared data and live observations

Import domain types with type-only imports from src/game/types.ts:
PlayerState, NPCState, Position, EntityId, CharacterStats, GameTime, Goal and ActivityEvent.
useGameState() from src/game/state/GameContext.ts exposes deeply read-only initial
state. Player name, occupation, money, stats, inventory and goals are available there.
NPCState adds behavior and destination to PlayerState; use occupation for role labels.
Stats are 0..100, hunger grows toward starvation; money is whole game credits.

The context is not a live position store. createInitialGameState seeds five independent
NPC records with createInitialNPCs() from the pure npc/npcData module. For moving
positions, wire these existing FoundationSceneProps in Lead-owned App.tsx:

- onPlayerSnapshot(snapshot: PlayerSnapshot): detached observation at most 10 Hz;
  position, moving, isRunning, grounded, cameraYaw and interactionTargetId.
  Import PlayerSnapshot from src/game/player/Player.tsx. Position is capsule CENTER in meters.
- onNPCSnapshot(npcs: NPCState[]): detached observations at most 5 Hz; unique id,
  name, occupation, position, behavior and destination. Positions are FEET, y=0.15.

Lift only these bounded observations into a small UI parent when needed; keep
transient transforms in the scene. Use initial context data until the first snapshot.
Do not update React state in useFrame, add a global store, mutate context, or feed
live observations back as seeds. Player/NPC seed prop changes do not teleport or
resume routes; use an intentional remount key for reset. The scene passes context
seeds to existing Player and NPCPopulation; the production App does not subscribe yet.

## Nearby NPCs and interactions

Import getNearbyNPCs from src/game/npc. Call
getNearbyNPCs(latestNPCs, latestPlayer.position, radiusInMeters).
It includes the radius boundary, compares XZ only, returns nearest first with stable
ID tie-breaking, and returns original read-only records without mutating the input.
The UI chooses and labels a radius. No separate nearby provider exists or is needed.

FoundationScene also forwards interactables, onInteractionTargetChange and onInteract
from PlayerProps. Interactable (src/game/player/interaction.ts) has id, position, optional label and
disabled. Player selects nearest within 2 m in full 3D and invokes onInteract on E.
This differs from nearby XZ lookup. If adapting NPC feet positions, deliberately use
an interaction anchor near capsule/chest height. No target population is currently
wired, and these callbacks do not create dialogue, events or domain mutations.
Canvas must be focused for movement; keep text inputs outside it and test focus/blur
so typing commands does not move the player. Do not add another camera/Canvas/Physics.

## World data

Import WORLD_LANDMARKS, WORLD_BOUNDS and CITY_BUILDINGS from src/game/world.
WORLD_COLLIDERS is available for collision-aware tests, not a navigation service.

| Landmark ID | Label | Entrance X,Y,Z (meters) |
| --- | --- | --- |
| brew-and-bite | Brew & Bite | -14, 0.15, -9 |
| corner-mart | Corner Mart | 7, 0.15, -9 |
| parkside-apartments | Parkside Apartments | -16, 0.15, 9 |

WORLD_BOUNDS = {minX:-32,maxX:32,minZ:-28,maxZ:28}, derived from ground footprint.
It is suitable for map normalization, not a safe spawn rectangle: perimeter walls
occupy the outer 0.4 m, and buildings/props block interior areas. CITY_BUILDINGS holds
centers, sizes and facade orientation. Landmarks are not Business ownership records.
Y is up, forward -Z; road top y=0, sidewalk/plaza y=0.15. Grounded player center is
about y=0.87 / 1.02 respectively. Doors/interiors remain closed.

## Activity, commands and honest UI states

GameState.activity is an initially empty ActivityEvent array. ActivityEvent contains
id, atGameMinute (absolute minutes since day 1 midnight), kind
(system/interaction/goal/economy), message and optional actorId. There is no event
emitter, append action, command executor or provider mutation API. Render an honest
empty state; do not fabricate economy/goal events. New domain mutations require
Lead agreement, a tested pure operation and explicit provider action per AGENTS.md.

Time is paused at day 1 08:00. Sandbox movement is independent of that clock.
NPCPopulation enabled=false can freeze NPC movement, but FoundationScene currently
uses its default true. NPC occupations/stats are descriptive placeholders; there
are no schedules, jobs, needs updates, relationships, memory or AI. No backend,
persistence, finished animation or dialogue. No additional dependency is required.

## QA expectations

Run typecheck, lint, test and build. Current baseline: 45 tests across six files.
Smoke test player movement, camera, closed building/perimeter collision, all five
NPCs, proximity display and UI focus behavior. Preserve real Rapier regression tests
and shared read-only contracts. Report limitations and exact checks in the PR;
coordinate cross-owner composition changes instead of introducing duplicate stores.
