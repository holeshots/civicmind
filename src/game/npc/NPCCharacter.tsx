import { useImperativeHandle, useMemo, useRef } from 'react'
import type { Ref } from 'react'
import type { Group } from 'three'
import type { Position } from '../types'
import type { NPCDefinition } from './npcData'
import { RepeatedMeshes } from '../world/RepeatedMeshes'
import type { MeshInstance } from '../world/RepeatedMeshes'

export interface NPCCharacterHandle {
  setPose: (position: Position, heading: number | null, walking: boolean, seconds: number) => void
}

/** Feet-anchored low-poly character. Imperative poses keep transient motion out of React. */
export function NPCCharacter({ definition, position, ref }: {
  definition: NPCDefinition; position: Position; ref?: Ref<NPCCharacterHandle>
}) {
  const root = useRef<Group>(null), leftLeg = useRef<Group>(null), rightLeg = useRef<Group>(null)
  const leftArm = useRef<Group>(null), rightArm = useRef<Group>(null)
  const phase = useRef(0)
  const a = definition.appearance
  const body = useMemo((): MeshInstance[] => [
    { position: [0, 1.08, 0], scale: [0.48, 0.6, 0.27], color: a.shirt },
    { position: [0, 0.75, 0], scale: [0.43, 0.13, 0.26], color: a.trousers },
    { position: [0, 1.57, 0], scale: [0.31, 0.35, 0.3], color: a.skin },
    { position: [0, 1.74, 0.03], scale: [0.33, 0.1, 0.32], color: a.hair },
    { position: [0, 1.6, 0.14], scale: [0.32, 0.25, 0.06], color: a.hair },
    { position: [-0.07, 1.59, -0.157], scale: [0.035, 0.035, 0.018], color: '#332e2b' },
    { position: [0.07, 1.59, -0.157], scale: [0.035, 0.035, 0.018], color: '#332e2b' },
    ...(definition.id === 'npc-maria' ? [{ position: [0, 0.98, -0.145], scale: [0.32, 0.5, 0.025], color: '#285e59' } satisfies MeshInstance] : []),
    ...(definition.id === 'npc-officer-reyes' ? [
      { position: [0, 1.81, -0.04], scale: [0.37, 0.08, 0.38], color: '#354f72' },
      { position: [-0.12, 1.2, -0.145], scale: [0.07, 0.09, 0.025], color: '#e3c479' },
    ] satisfies MeshInstance[] : []),
    ...(definition.id === 'npc-samantha' ? [{ position: [0, 1.1, 0.22], scale: [0.32, 0.42, 0.2], color: '#c7b982' } satisfies MeshInstance] : []),
  ], [a, definition.id])
  useImperativeHandle(ref, () => ({
    setPose(next, heading, walking, seconds) {
      if (!root.current) return
      root.current.position.set(next.x, next.y, next.z)
      if (heading !== null) {
        const difference = Math.atan2(Math.sin(heading - root.current.rotation.y), Math.cos(heading - root.current.rotation.y))
        root.current.rotation.y += difference * (1 - Math.exp(-12 * seconds))
      }
      if (walking) phase.current += seconds * definition.speed * 7
      const swing = walking ? Math.sin(phase.current) * 0.38 : 0
      if (leftLeg.current) leftLeg.current.rotation.x = swing
      if (rightLeg.current) rightLeg.current.rotation.x = -swing
      if (leftArm.current) leftArm.current.rotation.x = -swing * 0.7
      if (rightArm.current) rightArm.current.rotation.x = swing * 0.7
    },
  }), [definition.speed])
  return <group ref={root} name={definition.id} position={[position.x, position.y, position.z]}>
    <group scale={[a.width, a.height / 1.85, a.width]}>
      <RepeatedMeshes instances={body} />
      {[-1, 1].map(side => <group key={`leg-${side}`} ref={side === -1 ? leftLeg : rightLeg} position={[side * 0.13, 0.73, 0]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.18, 0.62, 0.21]} />
          <meshStandardMaterial color={a.trousers} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.66, -0.035]}>
          <boxGeometry args={[0.2, 0.12, 0.3]} />
          <meshStandardMaterial color="#303737" roughness={0.9} />
        </mesh>
      </group>)}
      {[-1, 1].map(side => <group key={`arm-${side}`} ref={side === -1 ? leftArm : rightArm} position={[side * 0.31, 1.31, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.14, 0.36, 0.18]} />
          <meshStandardMaterial color={a.shirt} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.43, 0]}>
          <boxGeometry args={[0.12, 0.2, 0.14]} />
          <meshStandardMaterial color={a.skin} roughness={0.9} />
        </mesh>
      </group>)}
    </group>
  </group>
}
