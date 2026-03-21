import { useMemo, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import {
  DAILY_MISSIONS,
  MISSION_BONUS_SPARKS,
  type DailyMission,
} from '../data/dailyMissions'
import { todayKey } from '../utils/dateKey'
import {
  getDailyMission,
  saveDailyMission,
  getGameProgress,
} from '../utils/storage'

// ─── useDailyMissions ─────────────────────────────────────────────────────────
//
// Returns today's 3 missions, live progress per mission, and completion state.
//
// Reactivity: `sparks` from AppContext increases whenever a game completes.
// We include it in useMemo deps so gamesCompletedToday recomputes immediately.
//
// Bonus guard: per-mission bonusGivenRef prevents double-awarding in the same
// React render session. The storage flag (bonusGiven) prevents double-awarding
// across page reloads.

export interface SingleMissionProgress {
  mission: DailyMission
  gamesCompletedToday: number
  gamesRequired: number
  isCompleted: boolean
}

export interface UseDailyMissionsReturn {
  missions: SingleMissionProgress[]
  isNewDay: boolean
  anyCompleted: boolean
}

// Keep legacy single-mission interface for backward compatibility
export interface UseDailyMissionReturn {
  mission: DailyMission
  gamesCompletedToday: number
  gamesRequired: number
  isCompleted: boolean
  isNewDay: boolean
}

export function useDailyMissions(): UseDailyMissionsReturn {
  const { activeProfileId, sparks, addSparks } = useApp()

  const today = todayKey()
  const dateNum = parseInt(today.replace(/-/g, ''), 10)

  // Pick 3 missions deterministically for today
  const idx1 = dateNum % DAILY_MISSIONS.length
  const idx2 = (dateNum + 3) % DAILY_MISSIONS.length
  const idx3 = (dateNum + 6) % DAILY_MISSIONS.length
  const todaysMissions = [DAILY_MISSIONS[idx1], DAILY_MISSIONS[idx2], DAILY_MISSIONS[idx3]]

  // Load stored state for today
  const savedState = getDailyMission(activeProfileId)
  const isNewDay = !savedState || savedState.dateKey !== today

  // Count games finished today
  const gamesCompletedToday = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number)
    const startOfDay = new Date(y, m - 1, d).getTime()
    const progress = getGameProgress(activeProfileId)
    return progress.filter(
      (p) => p.completed && p.lastPlayed >= startOfDay
    ).length
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, sparks, today])

  // Per-mission bonus refs (index 0, 1, 2)
  const bonusGivenRef0 = useRef(false)
  const bonusGivenRef1 = useRef(false)
  const bonusGivenRef2 = useRef(false)
  const bonusRefs = [bonusGivenRef0, bonusGivenRef1, bonusGivenRef2]

  // Sync bonus refs from storage on mount / profile switch
  useEffect(() => {
    if (!savedState || savedState.dateKey !== today) {
      bonusGivenRef0.current = false
      bonusGivenRef1.current = false
      bonusGivenRef2.current = false
      return
    }
    bonusGivenRef0.current = savedState.missions[0]?.bonusGiven ?? false
    bonusGivenRef1.current = savedState.missions[1]?.bonusGiven ?? false
    bonusGivenRef2.current = savedState.missions[2]?.bonusGiven ?? false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId])

  // Build per-mission progress objects
  const missions: SingleMissionProgress[] = todaysMissions.map((mission) => {
    const isCompleted = gamesCompletedToday >= mission.gamesRequired
    return {
      mission,
      gamesCompletedToday,
      gamesRequired: mission.gamesRequired,
      isCompleted,
    }
  })

  // Award bonus once per mission per day.
  // Guard: missions may be shorter than 3 if DAILY_MISSIONS pool is ever small.
  const m0done = missions[0]?.isCompleted ?? false
  const m1done = missions[1]?.isCompleted ?? false
  const m2done = missions[2]?.isCompleted ?? false

  useEffect(() => {
    missions.forEach((mp, i) => {
      if (!mp.isCompleted) return
      if (bonusRefs[i].current) return
      bonusRefs[i].current = true

      addSparks(MISSION_BONUS_SPARKS)

      // Build updated missions array for storage
      const storedMissions = todaysMissions.map((m, j) => ({
        missionId: m.id,
        bonusGiven: j <= i ? bonusRefs[j].current : false,
      }))

      saveDailyMission(activeProfileId, {
        dateKey: today,
        missions: storedMissions,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m0done, m1done, m2done])

  const anyCompleted = missions.some((m) => m.isCompleted)

  return { missions, isNewDay, anyCompleted }
}

// ─── Legacy single-mission hook (kept for backward compat) ───────────────────
export function useDailyMission(): UseDailyMissionReturn {
  const result = useDailyMissions()
  const first = result.missions[0]
  return {
    mission: first.mission,
    gamesCompletedToday: first.gamesCompletedToday,
    gamesRequired: first.gamesRequired,
    isCompleted: first.isCompleted,
    isNewDay: result.isNewDay,
  }
}
