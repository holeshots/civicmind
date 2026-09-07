# World + NPC foundation

Approved in conversation on 2026-09-06; user authorized continuing with implementation choices.
Base: `6aa6deb88bd29bea23c73ba5382db5fddef344ff` (`origin/main`).

Build one procedural, modern neighborhood approximately 64 by 56 meters. An east-west
road separates restaurant/store frontage from an apartment and small pedestrian plaza.
Brew & Bite has warm terracotta walls, teal canopy, readable locally drawn signage,
glazing and a recessed-looking entrance. Repeated windows, trees and props share geometry
through instancing. Ground is y=0; sidewalks are 0.15 m high. Simple fixed cuboids
cover ground, sidewalks, shells, large props and perimeter barriers. Shell data exposes
landmarks and entrance positions for later interiors; entrances are closed in Phase 1.

Export CityBlock and NPCPopulation into Lead's existing Physics/Canvas. Do not mount them
in production composition in this workstream. Use a temporary isolated browser harness
for visual, movement and collision verification, then remove it.

Five named NPCs use shared NPCState. Their positions represent feet in world meters,
unlike the existing player's capsule-center observation. Separate serializable state,
appearance, deterministic route decisions and movement. Sidewalk/plaza loops contain
no building intersections. Idle stops last 2–4 real seconds; walking is 0.8–1.2 m/s.
Movement uses real elapsed sandbox time, independently of the paused game clock;
an enabled prop permits Lead to freeze it. NPCs are non-blocking visual placeholders.

Pure initialization, movement and nearby queries are independently testable. Nearby
distance is horizontal XZ so feet and capsule-center coordinates interoperate. Runtime
motion stays local in refs; optional detached snapshots publish at most 5 Hz. No global
store or shared provider mutation. Lead must agree snapshot synchronization separately.

No dependencies, shared type changes, UI, player changes, AI, economy, external assets
or interiors. Root status documentation is the necessary cross-owner edit. Verify
typecheck, lint, tests, production build and a browser smoke check. Headless Rapier tests
exercise the existing motor against world collision data.
