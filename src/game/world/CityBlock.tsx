import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Building } from './Building'
import { CITY_BUILDINGS, SIDEWALKS, WORLD_COLLIDERS } from './cityBlockData'
import { RepeatedMeshes } from './RepeatedMeshes'
import type { MeshInstance } from './RepeatedMeshes'
import { StreetProps } from './StreetProps'

const surfaces: MeshInstance[] = [
  { position: [0, -0.25, 0], scale: [64, 0.5, 56], color: '#829282' },
  { position: [0, 0.003, 0], scale: [63.2, 0.006, 8], color: '#414c52' },
  ...SIDEWALKS.map(box => ({ position: box.position,
    scale: box.halfExtents.map(value => value * 2) as [number, number, number], color: '#cdcbbb' })),
  ...WORLD_COLLIDERS.filter(box => box.kind === 'boundary').map(box => ({ position: box.position,
    scale: box.halfExtents.map(value => value * 2) as [number, number, number], color: '#708074' })),
]
const markings: MeshInstance[] = [
  ...Array.from({ length: 16 }, (_, index) => ({ position: [-29 + index * 4, 0.012, 0],
    scale: [1.8, 0.01, 0.09], color: '#d6c59c' } satisfies MeshInstance)).filter(part => Math.abs(part.position[0]) > 3),
  ...[-22, 0, 22].flatMap(x => Array.from({ length: 8 }, (_, index) => ({
    position: [x, 0.014, -3.35 + index * 0.95], scale: [2.6, 0.012, 0.5], color: '#eee7d3',
  } satisfies MeshInstance))),
  ...[-3.8, 3.8].map(z => ({ position: [0, 0.012, z], scale: [63, 0.01, 0.07], color: '#d4d4c3' } satisfies MeshInstance)),
  // Subtle sidewalk joints add scale without individual pavement meshes.
  ...[-7, 7].flatMap(z => Array.from({ length: 31 }, (_, index) => ({
    position: [-30 + index * 2, 0.153, z], scale: [0.025, 0.004, 5.8], color: '#b7b9ab',
  } satisfies MeshInstance))),
]

/** Mount inside the existing Physics provider, replacing the small sandbox floor. */
export function CityBlock() {
  return <group name="city-block">
    <RigidBody type="fixed" colliders={false} name="city-static-collision">
      {WORLD_COLLIDERS.map(box => <CuboidCollider key={box.id} name={box.id} args={box.halfExtents} position={box.position} />)}
    </RigidBody>
    <RepeatedMeshes instances={surfaces} />
    <RepeatedMeshes instances={markings} />
    {CITY_BUILDINGS.map(building => <Building key={building.id} building={building} />)}
    <StreetProps />
  </group>
}
