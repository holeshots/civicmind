import { PLAYER_CONFIG as config } from './playerConfig'

/** Original primitive placeholder; center origin, Y up, visual forward -Z. */
export function PlayerCharacter() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[config.capsuleRadius, config.capsuleHalfHeight * 2, 8, 16]} />
        <meshStandardMaterial color="#61d9b0" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.45, -0.27]}>
        <boxGeometry args={[0.34, 0.14, 0.12]} />
        <meshStandardMaterial color="#183242" roughness={0.3} />
      </mesh>
    </group>
  )
}
