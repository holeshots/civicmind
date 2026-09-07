import { PCFShadowMap } from 'three'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { SCENE_CONFIG } from '../config'
import { Player } from '../player/Player'
import type { PlayerProps } from '../player/Player'
import { NPCPopulation } from '../npc'
import type { NPCPopulationProps } from '../npc'
import { CityBlock } from '../world'
import { useGameState } from '../state/GameContext'

/** Observation/interaction wiring for the DOM owner; no second store or simulation. */
export interface FoundationSceneProps {
  onPlayerSnapshot?: PlayerProps['onSnapshot']
  onNPCSnapshot?: NPCPopulationProps['onSnapshot']
  interactables?: PlayerProps['interactables']
  onInteract?: PlayerProps['onInteract']
  onInteractionTargetChange?: PlayerProps['onInteractionTargetChange']
}

export default function FoundationScene({ onPlayerSnapshot, onNPCSnapshot, interactables,
  onInteract, onInteractionTargetChange }: FoundationSceneProps) {
  const { player, npcs } = useGameState()
  return (
    <Canvas shadows={{ type: PCFShadowMap }} camera={{ position: SCENE_CONFIG.cameraPosition, fov: 45, near: 0.05, far: 200 }}
      dpr={[1, 1.5]} fallback={<p className="scene-message">WebGL is unavailable. Try a desktop browser with hardware acceleration.</p>}>
      <color attach="background" args={['#a6bec7']} />
      <ambientLight intensity={1.2} />
      <directionalLight castShadow position={[-20, 35, 20]} intensity={2.5}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-42} shadow-camera-right={42}
        shadow-camera-top={42} shadow-camera-bottom={-42} shadow-camera-near={1}
        shadow-camera-far={100} shadow-normalBias={0.04} />
      <Suspense fallback={<Html center><p className="scene-message">Loading physics…</p></Html>}>
        <Physics gravity={SCENE_CONFIG.gravity} timeStep={SCENE_CONFIG.physicsTimeStep}>
          <CityBlock />
          <NPCPopulation initialNPCs={npcs} onSnapshot={onNPCSnapshot} />
          <Player player={player} onSnapshot={onPlayerSnapshot} interactables={interactables}
            onInteract={onInteract} onInteractionTargetChange={onInteractionTargetChange} />
        </Physics>
      </Suspense>
    </Canvas>
  )
}
