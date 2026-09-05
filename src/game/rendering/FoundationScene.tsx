import { PCFShadowMap } from 'three'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import { SCENE_CONFIG } from '../config'
import { Player } from '../player/Player'
import { useGameState } from '../state/GameContext'

export default function FoundationScene() {
  const { player } = useGameState()
  return (
    <Canvas shadows={{ type: PCFShadowMap }} camera={{ position: SCENE_CONFIG.cameraPosition, fov: 45, near: 0.05 }}
      dpr={[1, 2]} fallback={<p className="scene-message">WebGL is unavailable. Try a desktop browser with hardware acceleration.</p>}>
      <color attach="background" args={['#111b25']} />
      <ambientLight intensity={0.65} />
      <directionalLight castShadow position={[5, 8, 4]} intensity={2.5} />
      <Suspense fallback={<Html center><p className="scene-message">Loading physics…</p></Html>}>
        <Physics gravity={SCENE_CONFIG.gravity} timeStep={SCENE_CONFIG.physicsTimeStep}>
          <RigidBody type="fixed" position={[0, -0.25, 0]} colliders={false}>
            <CuboidCollider args={[6, 0.25, 6]} />
            <mesh receiveShadow>
              <boxGeometry args={[12, 0.5, 12]} />
              <meshStandardMaterial color="#334852" roughness={0.9} />
            </mesh>
          </RigidBody>
          <Player player={player} />
        </Physics>
      </Suspense>
    </Canvas>
  )
}
