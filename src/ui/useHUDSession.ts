import { useCallback, useMemo, useState } from 'react'
import type { ActivityEvent, NPCState } from '../game/types'
import type { PlayerSnapshot } from '../game/player/Player'
import { useGameState } from '../game/state/GameContext'
import { appendActivity } from './hudModel'

/** Bounded observations and local event history; never fed back as simulation seeds. */
export function useHUDSession() {
  const state = useGameState()
  const [playerSnapshot, onPlayerSnapshot] = useState<PlayerSnapshot | null>(null)
  const [npcSnapshot, onNPCSnapshot] = useState<NPCState[] | null>(null)
  const [localEvents, setLocalEvents] = useState<readonly Readonly<ActivityEvent>[]>([])
  const appendEvent = useCallback((event: Readonly<ActivityEvent>) => {
    setLocalEvents(events => appendActivity(events, event))
  }, [])
  const events = useMemo(() => {
    const sharedIds = new Set(state.activity.map(event => event.id))
    return [...state.activity, ...localEvents.filter(event => !sharedIds.has(event.id))]
      .sort((a, b) => a.atGameMinute - b.atGameMinute)
  }, [state.activity, localEvents])
  return { playerSnapshot, npcs: npcSnapshot ?? state.npcs,
    onPlayerSnapshot, onNPCSnapshot, appendEvent, events, liveNPCs: npcSnapshot !== null }
}
