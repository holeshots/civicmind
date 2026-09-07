import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

const HUD_SCREENS = ['Map', 'Inventory', 'Stats', 'Relationships', 'Goals', 'Log', 'Settings'] as const
export type HudScreen = typeof HUD_SCREENS[number]
const symbols = ['◇', '▣', '▥', '♧', '⚑', '≡', '⚙']

export function HudNavigation({ active, onSelect }: { active: HudScreen | null; onSelect: (screen: HudScreen) => void }) {
  return <nav className="hud-navigation" aria-label="Game navigation">{HUD_SCREENS.map((screen, index) =>
    <button type="button" key={screen} onClick={() => onSelect(screen)} aria-haspopup="dialog" aria-expanded={active === screen}>
      <span aria-hidden="true">{symbols[index]}</span>{screen}</button>)}</nav>
}

/** Native modal owns focus containment; cleanup returns focus to the opener. */
export function HudDialog({ title, children, onClose }: { title: HudScreen; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const opener = document.activeElement
    const dialog = ref.current!
    dialog.showModal()
    return () => {
      dialog.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className="hud-dialog" aria-labelledby="hud-dialog-title"
    onCancel={event => { event.preventDefault(); onClose() }}>
    <header><div><p className="hud-kicker">CivicMind / Field notes</p><h2 id="hud-dialog-title">{title}</h2></div>
      <button type="button" onClick={onClose} aria-label={`Close ${title}`}>Close <kbd>Esc</kbd></button></header>
    <div className="hud-dialog-body">{children}</div>
  </dialog>
}
