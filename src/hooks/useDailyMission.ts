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

// ─── useDailyMission ──────────────────────────────────────────────────────────
//
// Returns today's mission, live progress, and completion state.
//
// Reactivity trick: `sparks` from AppContext increases whenever a game
// completes (addSparks is called). We include it in the useMemo dep array
// so gamesCompletedToday recomputes immediately without a separate event bus.
//
// Bonus guard: bonusGivenRef prevents double-awarding in the same React
// render session. The storage flag (bonusGiven) prevents double-awarding
// across page reloads.
//
// State machine:
//
//   new day                games >= required           bonus already given
//   ──────────────────────►───────────────────────────►────────────────────
//   isNewDay=true          isCompleted=true             bonusGiven=true (no-op)
//   bonusGiven=false       useEffect fires once         mount recheck skips
//   gamesCompletedToday=0  addSparks(50)
//

export interface UseDailyMissionReturn {
  mission: DailyMission
  gamesCompletedToday: number
  gamesRequired: number
  isCompleted: boolean
  isNewDay: boolean
}

export function useDailyMission(): UseDailyMissionReturn {
  const { activeProfileId, sparks, addSparks } = useApp()

  // ── Deterministic daily pick ─────────────────────────────────────────────
  // 20260321 % 10 = 1 → mission index 1. Changes every midnight (local time).
  const today = todayKey()
  const dateNum = parseInt(today.replace(/-/g, ''), 10)
  const mission = DAILY_MISSIONS[dateNum % DAILY_MISSIONS.length]

  // ── Was the bonus already given today? ───────────────────────────────────
  const savedState = getDailyMission(activeProfileId)
  const isNewDay = !savedState || savedState.dateKey !== today
  const storedBonusGiven = savedState?.dateKey === today && savedState.bonusGiven

  // ── Count games finished today ────────────────────────────────────────────
  // Parse "YYYY-MM-DD" into local-midnight timestamp so we only count games
  // whose lastPlayed timestamp falls within today's calendar day.
  const gamesCompletedToday = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number)
    const startOfDay = new Date(y, m - 1, d).getTime() // midnight local time
    const progress = getGameProgress(activeProfileId)
    return progress.filter(
      (p) => p.completed && p.lastPlayed >= startOfDay
    ).length
    // sparks is the reactive signal: it increases after every game that
    // calls addSparks. Including it re-runs this memo at the right moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId, sparks, today])

  const isCompleted = gamesCompletedToday >= mission.gamesRequired

  // ── Award bonus once per day ──────────────────────────────────────────────
  const bonusGivenRef = useRef(storedBonusGiven)

  // Keep ref in sync if profile switches mid-session
  useEffect(() => {
    bonusGivenRef.current = storedBonusGiven
  }, [storedBonusGiven])

  useEffect(() => {
    if (!isCompleted) return
    if (bonusGivenRef.current) return
    bonusGivenRef.current = true

    // Award sparks
    addSparks(MISSION_BONUS_SPARKS)

    // Persist so a page refresh doesn't re-award
    saveDailyMission(activeProfileId, {
      missionId: mission.id,
      dateKey: today,
      bonusGiven: true,
    })
  // addSparks is stable (useCallback), mission.id/today/activeProfileId are
  // primitive or stable — exhaustive deps would re-run too aggressively here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted])

  return {
    mission,
    gamesCompletedToday,
    gamesRequired: mission.gamesRequired,
    isCompleted,
    isNewDay,
  }
}
