# Gameplay physics

createCharacterMotor(world, body, collider) owns one Rapier character controller.
Call step(planarVelocity, dtSeconds) before each fixed physics step. The motor
sets the next kinematic translation after move-and-slide; grounded reports the
last solver result. Dispose before freeing/removing the world.

Use a position-based kinematic body and a capsule collider. The helper creates no
Physics provider and does not manage rendering or React state. Gravity is Y-only
from the existing world. See ../../player/README.md for dimensions, controls,
integration and limitations. characterMotor.test.ts runs against real Rapier WASM
without WebGL.
