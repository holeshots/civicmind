# NPC population — Lead integration handoff

## Exports

- `NPCPopulation`: feet-anchored humanoids with deterministic local movement.
- `createInitialNPCs(): NPCState[]`: fresh, complete records for all five NPCs.
- `NPC_DEFINITIONS`: stable IDs, role, route, walking speed, idle duration and appearance.
- `createNPCSimulation(seeds): NPCRuntime[]` and `advanceNPC(runtime, seconds)`:
  pure, serializable operations independent of React, Three and Rapier.
- `getNearbyNPCs(records, position, radius)`: inclusive XZ-radius search, nearest first,
  with stable ID tie-breaking. Returns original read-only observations without sorting
  or mutating the source array. Works with GameContext's deeply read-only NPC data.
- Derived types `NPCSeed`, `NPCRuntime`, `NPCPopulationProps`; no duplicated NPC contract.

## Behavior and integration

| NPC | Occupation | Speed (m/s) | Idle (real seconds) | Route area |
| --- | --- | --- | --- | --- |
| Maria | Restaurant Worker | 1.0 | 3 | Restaurant sidewalk |
| Marco | Business Owner | 0.9 | 4 | North sidewalk between shops |
| Samantha | Student | 1.2 | 2 | South sidewalk and plaza |
| Officer Reyes | Police Officer | 1.1 | 3 | Apartment sidewalk |
| Tito Ramon | Store Owner | 0.8 | 4 | Store sidewalk |

NPCState.position is the **feet** position in world meters, y=0.15. Nearby lookup
ignores Y so it accepts Player's capsule-center position without a height correction.
Each actor begins idle, then walks a four-point loop, stops at each waypoint, and
continues. Routes do not cross the roadway or solid props. There are no LLM/API calls,
random decisions, schedules, needs updates, relationships, jobs or economy behavior.
Occupation strings are descriptive. Initial NPC money/stats are neutral placeholders.

`NPCPopulation` defaults to `createInitialNPCs()`. `initialNPCs` accepts deeply read-only
shared records; omitted means the five defaults, while an explicit empty array means
no NPCs. Seeds must use known, unique IDs and their route-origin positions. Unknown,
duplicate, non-finite or off-route spawns throw a descriptive error instead of sending
pedestrians through buildings. This is a spawn API, not a save/resume format.
Changing initialNPCs does not teleport actors: remount with a new React key to reset.

No competing store or provider API is introduced. Lead can seed `GameState.npcs` with
`createInitialNPCs()` in a deliberate shared-state integration, then pass those records
as initialNPCs. Do not pass the current empty GameState.npcs and expect defaults.

Movement runs in **real sandbox seconds**, independently of the initially paused
GameTime, matching the existing player sandbox. Pass `enabled={false}` to freeze it;
Lead can explicitly choose `enabled={!time.paused}` if the sandbox should obey the
game clock. Long visual frame gaps are capped at 0.1 seconds, avoiding teleports on
tab return. The pure advance operation consumes all finite elapsed time and skips
whole deterministic loops efficiently.

`onSnapshot?: (npcs: NPCState[]) => void` receives detached structured clones at most
5 Hz (also when disabled). No per-frame React context writes occur. For nearby HUD
integration, combine these observations with Player.onSnapshot and getNearbyNPCs in
Lead's agreed observation layer. The shared provider currently has no mutation API;
this workstream does not invent one. Do not feed snapshots back into initialNPCs
expecting route progress to reset or restore.

## Rendering and limitations

`NPCCharacter` separates the visual representation from decisions and movement.
Clothing, hair, skin, height and width vary. Maria has an apron, Samantha a backpack,
and Officer Reyes a cap/badge. A simple gait swings arms/legs, with eased turns.
These are non-blocking visual placeholders: no NPC colliders, avoidance, animation
rigs, dialogue or interaction UI. Nearby detection supplies data only.

All character geometry is authored in code; no external assets or licenses needed.
`npcSimulation.test.ts` covers state isolation, shared read-only compatibility,
transitions, elapsed-time invariance, invalid input, route safety and nearby queries.

Recommended next NPC task: agree snapshot synchronization with Lead/UI, then add
stable interaction targets and contextual dialogue entry points without an AI service.
