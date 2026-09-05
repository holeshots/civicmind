import { useCallback, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { PLAYER_CONFIG as config } from './playerConfig'

export interface PlayerControls {
  keys: Set<string>
  interactQueued: boolean
  yaw: number
  pitch: number
}
const gameKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyE'])

/** Click/tab to focus canvas. Blur, hidden tabs and DOM focus always release held input. */
export function usePlayerControls(enabled = true) {
  const canvas = useThree(state => state.gl.domElement)
  const controls = useRef<PlayerControls>({
    keys: new Set(), interactQueued: false, yaw: 0, pitch: config.cameraPitch,
  })
  useEffect(() => {
    const input = controls.current
    const oldTabIndex = canvas.getAttribute('tabindex')
    const oldLabel = canvas.getAttribute('aria-label')
    canvas.setAttribute('tabindex', '0')
    canvas.setAttribute('aria-label', 'Game view. WASD to move, Shift to run, E to interact. Drag to look.')
    let pointerId: number | null = null
    let lastX = 0, lastY = 0
    const clear = () => {
      input.keys.clear()
      input.interactQueued = false
      if (pointerId !== null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId)
      pointerId = null
    }
    const active = () => enabled && document.activeElement === canvas && !document.hidden
    const keydown = (event: KeyboardEvent) => {
      if (!active() || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) { clear(); return }
      if (!gameKeys.has(event.code)) return
      event.preventDefault()
      input.keys.add(event.code)
      if (event.code === 'KeyE' && !event.repeat) input.interactQueued = true
    }
    const keyup = (event: KeyboardEvent) => { input.keys.delete(event.code) }
    const down = (event: PointerEvent) => {
      if (!enabled || (event.button !== 0 && event.button !== 2)) return
      canvas.focus({ preventScroll: true })
      pointerId = event.pointerId
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }
    const move = (event: PointerEvent) => {
      if (!active() || pointerId !== event.pointerId) return
      input.yaw -= (event.clientX - lastX) * config.cameraSensitivity
      input.yaw = Math.atan2(Math.sin(input.yaw), Math.cos(input.yaw))
      input.pitch = Math.max(config.cameraMinPitch, Math.min(config.cameraMaxPitch,
        input.pitch + (event.clientY - lastY) * config.cameraSensitivity))
      lastX = event.clientX
      lastY = event.clientY
    }
    const up = () => {
      if (pointerId !== null && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId)
      pointerId = null
    }
    const context = (event: MouseEvent) => { if (enabled) event.preventDefault() }
    const focus = () => { if (!active()) clear() }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    document.addEventListener('focusin', focus)
    canvas.addEventListener('blur', clear)
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', clear)
    canvas.addEventListener('lostpointercapture', up)
    canvas.addEventListener('contextmenu', context)
    return () => {
      clear()
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
      document.removeEventListener('focusin', focus)
      canvas.removeEventListener('blur', clear)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', clear)
      canvas.removeEventListener('lostpointercapture', up)
      canvas.removeEventListener('contextmenu', context)
      if (oldTabIndex === null) canvas.removeAttribute('tabindex')
      else canvas.setAttribute('tabindex', oldTabIndex)
      if (oldLabel === null) canvas.removeAttribute('aria-label')
      else canvas.setAttribute('aria-label', oldLabel)
    }
  }, [canvas, enabled])
  const consumeInteraction = useCallback(() => {
    const queued = controls.current.interactQueued
    controls.current.interactQueued = false
    return queued
  }, [])
  return { controls, consumeInteraction }
}
