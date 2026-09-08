# Gameplay + Physics handoff

Implemented on `codex/gameplay-foundation`, from current `origin/main`
`0a81cc87df09737202b683f389a2b0176c1428b2`.
Lead has integrated Player into the existing FoundationScene Canvas/Physics.
PROJECT_STATUS.md contains the completed integration review and verification.

## Integration contract (completed in FoundationScene)

1. Import `Player` from `src/game/player/Player.tsx`.
2. Read `player` from the existing `useGameState()` provider.
3. Mount `<Player player={player} />` INSIDE the existing Physics in
   FoundationScene. Keep the existing Canvas, lights, gravity and fixed timestep.
4. Remove sandbox OrbitControls and its import: Player owns the active camera.
5. Remove or relocate the falling demo cube: it shares the default player spawn.
6. Provide solid ground and simple explicit colliders for walls/curbs. Ground top
   is Y=0. Shared initial capsule center is (0,1.2,7), settling near Y=1.02 on the sidewalk.
   Reserve at least 0.31 m horizontal radius and 1.74 m vertical clearance.
7. Ensure the DOM HUD lets pointer events reach the canvas outside its controls.
   The player accepts keyboard input only while the canvas has focus.
8. Map world entities into Interactable props and wire callbacks to UI through
   Lead-owned state. Do not write snapshots back through an invented context setter.
9. For reset/teleport, remount Player with a new React key and the desired
   spawn position. Position prop changes alone intentionally do not teleport.
10. Repeat the smoke check in the integrated city: spawn clearance, walls,
    stairs, camera obstruction, focus changes, and pause policy.

Example within the existing scene (not a second Canvas/Physics):

```tsx
<Player
  key={sessionId}
  player={player}
  interactables={interactionAnchors}
  onInteractionTargetChange={handleNearbyTarget}
  onInteract={handleInteraction}
  onSnapshot={handlePlayerObservation}
/>
```

All callback wiring above belongs to Lead. No new shared game-state operations or
changes to src/game/types.ts were needed.

## Controls and feel

- Click or Tab into the game canvas to enable keyboard input.
- W/S: forward/back; A/D: strafe, relative to camera heading.
- Either Shift: run. Diagonal input is normalized.
- Hold left or right mouse button and drag: orbit/look; no pointer lock required.
- E: one interaction request per fresh key press, if a target is in range.
- Focus elsewhere, switch window/tab, or set enabled=false to release input.
  Horizontal momentum eases to rest; gravity continues.
- No jumping or touch/gamepad bindings in this phase.

Walk 3 m/s; run 6 m/s. Exponential acceleration response 12/s, stopping 18/s,
visual turning 14/s. Visual forward is -Z, Y up. Physics uses the world's timestep,
not render-frame delta; the initial paused simulation clock does not stop motion.

Capsule radius 0.3 m, cylindrical half-height 0.55 m (total height 1.7 m).
Motor: 0.02 m skin, 0.3 m autostep, 0.2 m minimum landing width, 0.3 m ground snap,
45-degree climb/slide threshold, terminal falling speed 50 m/s. Gravity comes
from world.gravity.y. Dynamic objects block movement; pushing is not enabled.

Camera: 5 m default distance, 0.35 rad elevation, clamped to [-0.15,1.15].
Follow uses the interpolated rendered anchor and delta-time smoothing. A 0.2 m
sphere sweep excludes the player's body and sensors; obstruction retracts
immediately and clearing it eases the camera outward. Collider geometry is required.

## Exports and contracts

- `Player`, `PlayerProps`, `PlayerSnapshot` from Player.tsx: mountable body,
  motor, appearance and active camera. Uses the existing PlayerState.
- `PlayerCharacter`: original primitive capsule/visor placeholder. No external
  assets or licenses. Replace using Player's `character` ReactNode prop, with
  center origin and -Z forward; physics remains independent of visual detail.
- `ThirdPersonCamera`: internal composition export using body, anchor and controls
  refs. Player already mounts it; do not add a second instance.
- `usePlayerControls(enabled)`: canvas-scoped keyboard/orbit refs and
  `consumeInteraction()`; Player already owns this hook's lifetime.
- `PLAYER_CONFIG`: movement, collider, camera and interaction settings.
- `movementVelocity`, `approachVelocity`, `smoothAngle`: pure movement helpers;
  movementVelocity accepts a reusable output object.
- `Interactable`, `nearestInteractable`: serializable entity adapter and pure
  selector. Reuses shared EntityId/Position; does not duplicate PlayerState.

Interactable: id, position (world-space anchor in meters), optional label/disabled.
Supply unique stable IDs. Selection uses 3D distance from the capsule center,
inclusive 2 m radius, with ID ordering for equal-distance ties. Updates/removals
in props are recognized on the next frame. The target callback emits on ID change,
including initial selection/null. E receives the latest selected target.

PlayerSnapshot: detached serializable position (capsule CENTER in meters), moving,
isRunning, grounded, cameraYaw (radians; 0 toward -Z, positive toward -X), and
interactionTargetId. Optional onSnapshot emits at most 10 Hz. Moving is based on
actual horizontal displacement per physics step, so a blocked player is idle.
isRunning means actual motion with Shift held, not an animation clip or stamina
state. UI may store these observations; shared GameState is never mutated here.

## Verification

Integration checks: npm run typecheck, npm run lint, npm run test (21 tests in 4 files),
and npm run build all passed. Vite retains the existing large-chunk advisory.
The build now mounts Player in the Lead-owned sandbox.

Automated: movement normalization, camera-relative vectors, walking/running,
acceleration/stopping, smoothing at 30/120 Hz, shortest-angle rotation, nearest
interaction/vertical separation/boundary/disabled/ties. Real Rapier tests exercise
gravity, floor contact, a running wall collision, 20 cm curb, and falling off ground.

Browser: temporary isolated fixture mounted Player under one Canvas/Physics in
React StrictMode; fixture removed before delivery. Observed capsule/shadows,
grounded rest at Y=0.8601, WASD-compatible key replay, 2.36 m walk versus 4.62 m run
over equal input windows, E callback once, no text-focus movement, wall stop
at Z=-3.54, mouse orbit and camera-relative forward movement (yaw -1.5,
approximately +2.01 m X / -0.14 m Z), smooth following/rotation and target loss
on leaving range. Basic camera sweep was exercised with a wall behind spawn.
Disabled-control probe produced zero X/Z displacement; native E key emitted one
callback and reset restored spawn. Browser console had no errors; the throwaway
fixture used default soft shadows and emitted a Three shadow deprecation warning,
alongside the existing Three.Clock and Rapier initialization deprecations.
Independent read-only code review found no actionable issues.

## Limitations and next work

Integration into FoundationScene and PROJECT_STATUS updates are complete. No dialogue/HUD,
simulation-clock gating, save synchronization, animation, jump, dynamic-body
pushing, moving-platform support guarantees or out-of-world respawn.

Interactions are proximity-only: no line-of-sight test, facing cone or permission
checks, so nearby targets behind walls may be selected. Caller owns target data,
UI selection cleanup on unmount, and callback side effects. Camera obstruction is
basic: no shoulder switching or fading; tight spaces can bring it close to the
character. Unusual slopes, moving platforms and dense city geometry need further
integrated QA. Rendering tests are a manual smoke, not a persistent browser suite.

Recommended next gameplay task: integrate against CityBlock's actual spawn and
colliders, then replace the placeholder with licensed idle/walk/run GLB animation
while keeping this collider and input contract.

Reference: [Rapier character controller](https://rapier.rs/docs/user_guides/javascript/character_controller/).

## Integration regression fix

The original 0.01 m skin plus snap-to-ground could sink through the 12 m sandbox
floor from spawn y=1. The motor now uses 0.02 m skin and normal gravity accumulation
instead of forced grounded -1 m/s. Sustained idle/running tests check clearance at
30/60/120 Hz. Player accepts only the ID and position fields it reads, so the
read-only shared context is compatible without casting or copying inventory.
