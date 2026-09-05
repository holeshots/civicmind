import { createContext, useContext } from 'react'
import type { GameState } from '../types'

type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

export const GameContext = createContext<DeepReadonly<GameState> | null>(null)

export function useGameState() {
  const state = useContext(GameContext)
  if (!state) throw new Error('useGameState must be used within GameProvider')
  return state
}
