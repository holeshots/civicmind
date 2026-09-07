import { useLayoutEffect, useRef } from 'react'
import { Color, Object3D } from 'three'
import type { InstancedMesh } from 'three'
import type { Vector3Tuple } from './cityBlockData'

export interface MeshInstance {
  position: Vector3Tuple
  scale: Vector3Tuple
  color: string
  rotation?: Vector3Tuple
}

/** One draw call for repeated, static geometry; instance transforms never tick. */
export function RepeatedMeshes({ instances, shape = 'box', castShadow = false }: {
  instances: readonly MeshInstance[]
  shape?: 'box' | 'cylinder' | 'crown'
  castShadow?: boolean
}) {
  const mesh = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    if (!mesh.current) return
    const transform = new Object3D(), color = new Color()
    instances.forEach((instance, index) => {
      transform.position.set(...instance.position)
      transform.scale.set(...instance.scale)
      transform.rotation.set(...(instance.rotation ?? [0, 0, 0]))
      transform.updateMatrix()
      mesh.current!.setMatrixAt(index, transform.matrix)
      mesh.current!.setColorAt(index, color.set(instance.color))
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
    mesh.current.computeBoundingSphere()
  }, [instances])
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, instances.length]} castShadow={castShadow} receiveShadow>
      {shape === 'box' ? <boxGeometry /> : shape === 'cylinder'
        ? <cylinderGeometry args={[0.5, 0.5, 1, 8]} /> : <icosahedronGeometry args={[0.5, 1]} />}
      <meshStandardMaterial roughness={0.86} />
    </instancedMesh>
  )
}
