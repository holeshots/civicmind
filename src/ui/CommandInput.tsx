import { useState } from 'react'
import type { ActivityEvent, GameTime } from '../game/types'
import { COMMAND_LIMIT, createCommandEvent } from './hudModel'

export function CommandInput({ time, actorId, onEvent }: {
  time: Readonly<GameTime>; actorId: string; onEvent: (event: Readonly<ActivityEvent>) => void
}) {
  const [text, setText] = useState('')
  const [notice, setNotice] = useState('')
  return <div className="hud-command-wrap">
    <form className="hud-command" aria-label="Agent command" onSubmit={event => {
      event.preventDefault()
      const activity = createCommandEvent(text, time, actorId, crypto.randomUUID())
      if (!activity) { setNotice(`Enter a command of 1–${COMMAND_LIMIT} characters.`); return }
      onEvent(activity)
      setText('')
      setNotice('Command recorded in the log. No agent action was taken.')
    }}>
      <span className="hud-command-symbol" aria-hidden="true">↗</span>
      <label className="hud-sr-only" htmlFor="hud-command-input">Tell your agent what to do</label>
      <input id="hud-command-input" placeholder="Tell your agent what to do..." value={text}
        autoComplete="off" aria-describedby="hud-command-help"
        onChange={event => { setText(event.target.value); setNotice('') }}
        onKeyDown={event => { if (event.key === 'Enter' && event.nativeEvent.isComposing) event.preventDefault() }} />
      <button type="submit" disabled={!text.trim()}>Submit <span aria-hidden="true">↵</span></button>
    </form>
    <p id="hud-command-help" className="hud-footnote">Up to {COMMAND_LIMIT} characters · recorded only, no AI execution · resets on reload</p>
    <p className="hud-command-notice" role="status">{notice}</p>
  </div>
}
