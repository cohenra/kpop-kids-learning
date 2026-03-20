import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import {
  getGameProgress,
  saveGameProgress,
  type GameProgress,
} from '../utils/storage'

// ─── useProgress: per-profile game progress ───────────────────────────────────
//
// IMPORTANT: completeGame records progress only — it does NOT award sparks.
// Sparks are awarded per-round by individual game components via addSparks()
// (called via onComplete callback from the room hub).
// Having two spark-award paths would cause double-counting.

interface UseProgressReturn {
  getProgress: (roomId: string, gameId: string) => GameProgress | undefined
  completeGame: (roomId: string, gameId: string, score?: number) => void
  isGameCompleted: (roomId: string, gameId: string) => boolean
  getRoomProgress: (roomId: string) => GameProgress[]
  getTotalCompleted: () => number
}

export function useProgress(): UseProgressReturn {
  const { activeProfileId } = useApp()

  const getProgress = useCallback(
    (roomId: string, gameId: string): GameProgress | undefined => {
      const all = getGameProgress(activeProfileId)
      return all.find((p) => p.roomId === roomId && p.gameId === gameId)
    },
    [activeProfileId]
  )

  const completeGame = useCallback(
    (roomId: string, gameId: string, score = 100): void => {
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
      // Sparks are NOT awarded here — games handle their own rewards via onComplete.
    },
    [activeProfileId]
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
