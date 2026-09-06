import { useMemo } from 'react'
import type { CityBuilding } from './cityBlockData'
import { RepeatedMeshes } from './RepeatedMeshes'
import type { MeshInstance } from './RepeatedMeshes'
import { WorldSign } from './WorldSign'

export function Building({ building }: { building: CityBuilding }) {
  const [width, height, depth] = building.size
  const restaurant = building.id === 'brew-and-bite'
  const front = depth / 2
  const instances = useMemo(() => {
    const parts: MeshInstance[] = []
    const box = (position: MeshInstance['position'], scale: MeshInstance['scale'], color: string) =>
      parts.push({ position, scale, color })
    // A continuous shell now; facade and landmark data can survive a future interior swap.
    box([0, height / 2, 0], [width, height, depth], building.color)
    box([0, 0.25, 0], [width + 0.15, 0.5, depth + 0.15], '#77796f')
    box([0, height + 0.12, 0], [width + 0.5, 0.24, depth + 0.5], '#eee2c9')
    box([0, height + 0.3, -depth / 2], [width, 0.4, 0.2], building.color)
    box([0, height + 0.3, depth / 2], [width, 0.4, 0.2], building.color)
    box([-width / 2, height + 0.3, 0], [0.2, 0.4, depth], building.color)
    box([width / 2, height + 0.3, 0], [0.2, 0.4, depth], building.color)
    box([width / 4, height + 0.55, -1], [2, 0.7, 1.5], '#9baba8')
    // Framed glazed storefront bays leave a clearly visible central door.
    for (const x of [-width * 0.32, width * 0.32]) {
      box([x, 1.65, front + 0.045], [width * 0.27 + 0.18, 2.45, 0.1], '#ece1c7')
      box([x, 1.65, front + 0.11], [width * 0.27, 2.2, 0.06], '#426573')
      box([x, 1.65, front + 0.16], [0.075, 2.2, 0.04], building.accent)
      box([x, 1.7, front + 0.16], [width * 0.27, 0.065, 0.04], building.accent)
      box([x - width * 0.085, 2.05, front + 0.15], [0.15, 1.05, 0.03], '#8daeb4')
    }
    box([0, 1.4, front + 0.055], [1.75, 2.8, 0.14], '#f2e5c9')
    box([0, 1.3, front + 0.14], [1.45, 2.6, 0.08], building.accent)
    box([0, 1.7, front + 0.2], [1.15, 1.5, 0.05], '#517986')
    box([0.5, 1.1, front + 0.26], [0.07, 0.5, 0.05], '#f1cc84')
    // Canopy projects above head clearance. Colored valance establishes each shop identity.
    box([0, 3.35, front + 0.55], [width + 0.35, 0.15, 1.3], building.accent)
    box([0, 3.12, front + 1.17], [width + 0.35, 0.35, 0.08], building.accent)
    if (restaurant) {
      for (let x = -width / 2; x < width / 2; x += 1.5) {
        box([x + 0.35, 3.44, front + 0.55], [0.5, 0.025, 1.3], '#e6d0a8')
      }
    }
    for (let floor = 1; floor < building.floors; floor++) {
      // Reserve the ground-floor sign band before distributing upper-floor windows.
      const y = 4.5 + (floor - 0.5) * ((height - 4.5) / (building.floors - 1))
      for (let x = -width / 2 + 1.6; x < width / 2 - 0.8; x += 3) {
        box([x, y, front + 0.08], [1.55, 1.85, 0.13], '#e8dfca')
        box([x, y, front + 0.16], [1.3, 1.6, 0.06], '#4c6874')
        box([x, y, front + 0.21], [0.06, 1.6, 0.04], '#c6cabf')
        box([x, y - 0.97, front + 0.2], [1.8, 0.12, 0.4], '#ede0c3')
      }
    }
    // Side windows make the mass legible from the player's oblique approach.
    for (const side of [-1, 1]) {
      for (let floor = 0; floor < building.floors; floor++) {
        for (let z = -depth / 2 + 2; z < depth / 2 - 1; z += 3) {
          box([side * (width / 2 + 0.03), 1.8 + floor * (height / building.floors), z], [0.06, 1.6, 1.25], '#4c6874')
        }
      }
    }
    return parts
  }, [building, width, height, depth, front, restaurant])
  return (
    <group name={building.id} position={building.center} rotation={[0, building.facing * Math.PI / 180, 0]}>
      <RepeatedMeshes instances={instances} castShadow />
      <WorldSign title={building.name} subtitle={restaurant ? 'COFFEE  •  KITCHEN  •  COMMUNITY'
        : building.id === 'corner-mart' ? 'DAILY ESSENTIALS  /  OPEN EVERY DAY'
          : building.id === 'parkside-apartments' ? 'A PLACE TO CALL HOME' : 'NEIGHBORHOOD SPACES'}
        width={Math.min(width - 1, 10)} height={1.1} position={[0, 4.08, front + 0.18]} color={building.accent} />
    </group>
  )
}
