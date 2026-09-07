import { useEffect, useState } from 'react'

export function useDebugToggle() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      const target = event.target
      if (event.code !== 'Backquote' || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey
        || (target instanceof Element && target.closest('input, textarea, select, [contenteditable], dialog'))) return
      event.preventDefault()
      setVisible(value => !value)
    }
    window.addEventListener('keydown', toggle)
    return () => window.removeEventListener('keydown', toggle)
  }, [])
  return { visible, setVisible }
}
