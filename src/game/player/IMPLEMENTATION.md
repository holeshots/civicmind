# Gameplay foundation design and plan

Scope: new gameplay subsystem within the existing Phase 1 architecture.
The supplied request is the implementation specification. Lead owns integration.

Design: use Rapier's position-based kinematic capsule with explicit gravity,
move-and-slide, 0.3 m autostep and ground snapping. A dynamic velocity body is
simpler but less reliable on curbs; a custom solver duplicates existing Rapier.
The capsule center uses PlayerState.position in world meters. Visual forward is
-Z. Camera yaw drives normalized WASD motion. Smooth velocity and shortest-path
visual yaw use delta time. Mouse drag orbits a clamped follow camera, with a
sphere sweep against colliders for basic obstruction. No shared context writes.
Interaction targets reuse EntityId and Position; nearest enabled target within
2 m is exposed on change, and E emits a callback. No dialogue or HUD.

Execution:
- [x] Add movement and interaction tests, observe failure, implement pure helpers.
- [x] Add real Rapier tests for gravity, floor, wall, curb and ledge behavior;
      implement reusable character motor in systems/physics.
- [x] Bind keyboard input with focus/blur guards; compose Player, replaceable
      PlayerCharacter and ThirdPersonCamera under the existing Physics provider.
- [x] Verify typecheck, lint, tests and build. Use a temporary smoke fixture
      mounting exports without committing changes in Lead-owned composition.
- [x] Document exports, integration, controls, settings and verification limits
      in player/README.md. Leave root PROJECT_STATUS.md for Lead.
