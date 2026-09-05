import { useState, type ReactNode } from 'react'
import { GameContext } from './GameContext'
import { createInitialGameState } from './initialState'

export function GameProvider({ children }: { children: ReactNode }) {
  const [state] = useState(createInitialGameState)
  return <GameContext value={state}>{children}</GameContext>
}
