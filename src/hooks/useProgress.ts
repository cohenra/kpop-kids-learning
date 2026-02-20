import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import {
  getGameProgress,
  saveGameProgress,
  type GameProgress,
} from '../utils/storage'
import { SPARKS_PER_GAME } from '../data/games'

// ─── useProgress: per-profile game progress ───────────────────────────────────

interface UseProgressReturn {
  getProgress: (roomId: string, gameId: string) => GameProgress | undefined
  completeGame: (roomId: string, gameId: string, score?: number) => number
  isGameCompleted: (roomId: string, gameId: string) => boolean
  getRoomProgress: (roomId: string) => GameProgress[]
  getTotalCompleted: () => number
}

export function useProgress(): UseProgressReturn {
  const { activeProfileId, age, addSparks } = useApp()

  const getProgress = useCallback(
    (roomId: string, gameId: string): GameProgress | undefined => {
      const all = getGameProgress(activeProfileId)
      return all.find((p) => p.roomId === roomId && p.gameId === gameId)
    },
    [activeProfileId]
  )

  const completeGame = useCallback(
    (roomId: string, gameId: string, score = 100): number => {
      const existing = getGameProgress(activeProfileId).find(
        (p) => p.roomId === roomId && p.gameId === gameId
      )

      const updated: GameProgress = {
        roomId,
        gameId,
        completed: true,
        highScore: Math.max(score, existing?.highScore ?? 0),
        timesPlayed: (existing?.timesPlayed ?? 0) + 1,
        lastPlayed: Date.now(),
      }
      saveGameProgress(activeProfileId, updated)

      // Award sparks
      const earned = SPARKS_PER_GAME[age]
      addSparks(earned)
      return earned
    },
    [activeProfileId, age, addSparks]
  )

  const isGameCompleted = useCallback(
    (roomId: string, gameId: string): boolean => {
      const progress = getGameProgress(activeProfileId)
      return progress.some(
        (p) => p.roomId === roomId && p.gameId === gameId && p.completed
      )
    },
    [activeProfileId]
  )

  const getRoomProgress = useCallback(
    (roomId: string): GameProgress[] => {
      return getGameProgress(activeProfileId).filter(
        (p) => p.roomId === roomId
      )
    },
    [activeProfileId]
  )

  const getTotalCompleted = useCallback((): number => {
    return getGameProgress(activeProfileId).filter((p) => p.completed).length
  }, [activeProfileId])

  return {
    getProgress,
    completeGame,
    isGameCompleted,
    getRoomProgress,
    getTotalCompleted,
  }
}
