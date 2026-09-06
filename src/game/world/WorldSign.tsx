import { useEffect, useRef } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import type { Vector3Tuple } from './cityBlockData'

/** Local system font baked into a texture; no network fonts, HTML overlays or assets. */
export function WorldSign({ title, subtitle, width, height, position, color = '#235b57' }: {
  title: string; subtitle: string; width: number; height: number
  position: Vector3Tuple; color?: string
}) {
  const mesh = useRef<Mesh<PlaneGeometry, MeshBasicMaterial>>(null)
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context || !mesh.current) return
    context.fillStyle = color
    context.fillRect(0, 0, 1024, 256)
    context.strokeStyle = '#e7cc98'
    context.lineWidth = 4
    context.strokeRect(12, 12, 1000, 232)
    context.textAlign = 'center'
    context.fillStyle = '#fff3d9'
    context.font = 'bold 86px Georgia, serif'
    context.fillText(title, 512, 125, 960)
    context.font = '500 29px Arial, sans-serif'
    context.fillText(subtitle, 512, 194, 940)
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    const material = mesh.current.material
    material.map = texture
    material.needsUpdate = true
    return () => { material.map = null; material.needsUpdate = true; texture.dispose() }
  }, [title, subtitle, color])
  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial toneMapped={false} />
    </mesh>
  )
}
