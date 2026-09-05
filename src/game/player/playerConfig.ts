/** Distances in meters, speeds in m/s, angles in radians. */
export const PLAYER_CONFIG = {
  walkSpeed: 3, runSpeed: 6, acceleration: 12, deceleration: 18, turnSpeed: 14,
  capsuleRadius: 0.3, capsuleHalfHeight: 0.55,
  interactionRadius: 2,
  cameraDistance: 5, cameraPitch: 0.35, cameraMinPitch: -0.15,
  cameraMaxPitch: 1.15, cameraSensitivity: 0.005, cameraFollow: 14,
  cameraRadius: 0.2,
} as const
