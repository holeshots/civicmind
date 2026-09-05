import { PCFShadowMap } from 'three'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { SCENE_CONFIG } from '../config'

export default function FoundationScene() {
  return (
    <Canvas shadows={{ type: PCFShadowMap }} camera={{ position: SCENE_CONFIG.cameraPosition, fov: 45 }}
      dpr={[1, 2]} fallback={<p className="scene-message">WebGL is unavailable. Try a desktop browser with hardware acceleration.</p>}>
      <color attach="background" args={['#111b25']} />
      <ambientLight intensity={0.65} />
      <directionalLight castShadow position={[5, 8, 4]} intensity={2.5} />
      <Suspense fallback={<Html center><p className="scene-message">Loading physics…</p></Html>}>
        <Physics gravity={SCENE_CONFIG.gravity} timeStep={SCENE_CONFIG.physicsTimeStep}>
          <RigidBody type="fixed" position={[0, -0.25, 0]} colliders="cuboid">
            <mesh receiveShadow>
              <boxGeometry args={[12, 0.5, 12]} />
              <meshStandardMaterial color="#334852" roughness={0.9} />
            </mesh>
          </RigidBody>
          <RigidBody position={[0, 3, 0]} colliders="cuboid" restitution={0.35}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#7ce1b7" roughness={0.35} />
            </mesh>
          </RigidBody>
        </Physics>
      </Suspense>
      <OrbitControls makeDefault target={[0, 0.5, 0]} minDistance={3} maxDistance={24} maxPolarAngle={Math.PI / 2 - 0.05} />
    </Canvas>
  )
}

