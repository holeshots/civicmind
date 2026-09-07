import { BENCH_POSITIONS, LIGHT_POSITIONS, TREE_POSITIONS } from './cityBlockData'
import { RepeatedMeshes } from './RepeatedMeshes'
import type { MeshInstance } from './RepeatedMeshes'

const planters: MeshInstance[] = TREE_POSITIONS.map(([x, y, z]) => ({
  position: [x, y + 0.25, z], scale: [1.4, 0.5, 1.4], color: '#9b9d8b',
}))
const trunks: MeshInstance[] = TREE_POSITIONS.map(([x, y, z]) => ({
  position: [x, y + 1.6, z], scale: [0.3, 3, 0.3], color: '#745641',
}))
const crowns: MeshInstance[] = TREE_POSITIONS.flatMap(([x, y, z], index) => [
  { position: [x, y + 3.3, z], scale: [2.7, 3, 2.7], color: index % 2 ? '#6d8f58' : '#527c5a' },
  { position: [x + 0.65, y + 3.7, z + 0.25], scale: [1.8, 2, 1.8], color: '#86a365' },
] satisfies MeshInstance[])
const benches: MeshInstance[] = BENCH_POSITIONS.flatMap(([x, y, z]) => [
  ...[-0.85, 0.85].map(offset => ({ position: [x + offset, y + 0.25, z], scale: [0.12, 0.5, 0.65], color: '#394e50' } satisfies MeshInstance)),
  ...[-0.24, 0, 0.24].map(offset => ({ position: [x, y + 0.52, z + offset], scale: [2.4, 0.1, 0.18], color: '#b48754' } satisfies MeshInstance)),
  ...[0.78, 1.02].map(height => ({ position: [x, y + height, z + 0.34], scale: [2.4, 0.18, 0.1], color: '#b48754' } satisfies MeshInstance)),
])
const lights: MeshInstance[] = LIGHT_POSITIONS.flatMap(([x, y, z]) => [
  { position: [x, y + 2.6, z], scale: [0.18, 5.2, 0.18], color: '#384b50' },
  { position: [x, y + 5.2, z + (z < 0 ? 0.5 : -0.5)], scale: [0.35, 0.14, 1.25], color: '#384b50' },
] satisfies MeshInstance[])
const bins: MeshInstance[] = [[-2, 8.7], [11, 23]].flatMap(([x, z]) => [
  { position: [x, 0.5, z], scale: [0.5, 0.7, 0.5], color: '#455f58' },
  { position: [x, 0.9, z], scale: [0.56, 0.1, 0.56], color: '#344442' },
] satisfies MeshInstance[])

export function StreetProps() {
  return <group name="street-furniture">
    <RepeatedMeshes instances={planters} />
    <RepeatedMeshes instances={trunks} shape="cylinder" />
    <RepeatedMeshes instances={crowns} shape="crown" castShadow />
    <RepeatedMeshes instances={benches} />
    <RepeatedMeshes instances={lights} />
    <RepeatedMeshes instances={bins} />
    {LIGHT_POSITIONS.map(([x, y, z], index) => <mesh key={index} position={[x, y + 5.12, z + (z < 0 ? 0.65 : -0.65)]}>
      <boxGeometry args={[0.24, 0.035, 0.7]} />
      <meshStandardMaterial color="#ffedbe" emissive="#ffdc95" emissiveIntensity={1.2} />
    </mesh>)}
  </group>
}
