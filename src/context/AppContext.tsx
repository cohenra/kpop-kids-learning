import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { Profile, AgeProfile } from '../utils/storage'
import {
  getProfile,
  getActiveProfileId,
  setActiveProfileId,
  saveProfile,
  updateProfileSparks,
  updateProfileStageItems,
  updateProfileBandMembers,
  hasAnyProfile,
  getGameProgress,
} from '../utils/storage'
import { getUnlockedStageItems, BAND_MEMBERS, BANDMATE_THRESHOLDS } from '../data/rewards'
import type { Language } from '../i18n/strings'
import type { BandMember } from '../data/rewards'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppContextValue {
  // Active profile
  activeProfile: Profile | null
  activeProfileId: 1 | 2
  setActiveProfileId: (id: 1 | 2) => void

  // Language & RTL
  language: Language
  isRTL: boolean
  setLanguage: (lang: Language) => void

  // Sparks
  sparks: number
  addSparks: (amount: number) => void

  // Stage items
  unlockedStageItems: string[]

  // Band members
  unlockedBandMembers: string[]

  // Bandmate unlock notification
  newlyUnlockedBandmate: BandMember | null
  dismissBandmate: () => void

  // Profile management
  reloadProfile: () => void
  isFirstLaunch: boolean

  // Age
  age: AgeProfile
}

const AppContext = createContext<AppContextValue | null>(null)

// ─── Helper: compute which bandmates should be unlocked ──────────────────────

function computeUnlockedBandmates(
  profileId: 1 | 2,
  totalSparks: number,
  currentUnlocked: string[],
  stageUnlocked: string[],
): string[] {
  const completedCount = getGameProgress(profileId).filter((p) => p.completed).length
  const stageComplete = stageUnlocked.length >= 6

  const newUnlocked = [...currentUnlocked]
  for (const threshold of BANDMATE_THRESHOLDS) {
    if (newUnlocked.includes(threshold.memberId)) continue
    if (threshold.gamesRequired === Infinity) {
      // Kiki — requires full stage
      if (stageComplete) newUnlocked.push(threshold.memberId)
    } else if (completedCount >= threshold.gamesRequired) {
      newUnlocked.push(threshold.memberId)
    }
  }
  // Suppress lint warning: totalSparks is kept as a parameter for future use
  void totalSparks
  return newUnlocked
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<1 | 2>(
    getActiveProfileId
  )
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() =>
    getProfile(getActiveProfileId())
  )
  const [language, setLanguageState] = useState<Language>(
    () => activeProfile?.language ?? 'he'
  )
  const [sparks, setSparks] = useState<number>(activeProfile?.sparks ?? 0)
  const [unlockedStageItems, setUnlockedStageItems] = useState<string[]>(
    activeProfile?.unlockedStageItems ?? []
  )
  const [unlockedBandMembers, setUnlockedBandMembers] = useState<string[]>(
    activeProfile?.unlockedBandMembers ?? []
  )
  // The bandmate that just unlocked — shown in celebration overlay
  const [newlyUnlockedBandmate, setNewlyUnlockedBandmate] = useState<BandMember | null>(null)
  const [isFirstLaunch] = useState<boolean>(!hasAnyProfile())

  // Sync RTL with language
  const isRTL = language === 'he'

  // Apply RTL to document
  useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', language)
  }, [isRTL, language])

  const reloadProfile = useCallback(() => {
    const profile = getProfile(activeProfileId)
    setActiveProfile(profile)
    if (profile) {
      setSparks(profile.sparks)
      setUnlockedStageItems(profile.unlockedStageItems)
      setUnlockedBandMembers(profile.unlockedBandMembers)
      setLanguageState(profile.language)
    }
  }, [activeProfileId])

  const handleSetActiveProfileId = useCallback((id: 1 | 2) => {
    setActiveProfileId(id)
    setActiveProfileIdState(id)
    const profile = getProfile(id)
    setActiveProfile(profile)
    if (profile) {
      setSparks(profile.sparks)
      setUnlockedStageItems(profile.unlockedStageItems)
      setUnlockedBandMembers(profile.unlockedBandMembers)
      setLanguageState(profile.language)
    }
  }, [])

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang)
      if (activeProfile) {
        const updated: Profile = { ...activeProfile, language: lang }
        saveProfile(updated)
        setActiveProfile(updated)
      }
    },
    [activeProfile]
  )

  const addSparks = useCallback(
    (amount: number) => {
      if (!activeProfile) return
      const newTotal = sparks + amount
      setSparks(newTotal)
      updateProfileSparks(activeProfileId, newTotal)

      // Check for newly unlocked stage items
      const newStageUnlocked = getUnlockedStageItems(newTotal, unlockedStageItems)
      let stageChanged = false
      if (newStageUnlocked.length !== unlockedStageItems.length) {
        setUnlockedStageItems(newStageUnlocked)
        updateProfileStageItems(activeProfileId, newStageUnlocked)
        stageChanged = true
      }

      // Check for newly unlocked bandmates (needs latest game progress from storage)
      const effectiveStage = stageChanged ? newStageUnlocked : unlockedStageItems
      const newBandUnlocked = computeUnlockedBandmates(
        activeProfileId,
        newTotal,
        unlockedBandMembers,
        effectiveStage,
      )

      if (newBandUnlocked.length > unlockedBandMembers.length) {
        // Find which members are newly unlocked (in order)
        const justUnlockedId = newBandUnlocked.find((id) => !unlockedBandMembers.includes(id))
        setUnlockedBandMembers(newBandUnlocked)
        updateProfileBandMembers(activeProfileId, newBandUnlocked)

        if (justUnlockedId) {
          const member = BAND_MEMBERS.find((m) => m.id === justUnlockedId)
          if (member) setNewlyUnlockedBandmate(member)
        }
      }
    },
    [activeProfile, activeProfileId, sparks, unlockedStageItems, unlockedBandMembers]
  )

  const dismissBandmate = useCallback(() => {
    setNewlyUnlockedBandmate(null)
  }, [])

  const age: AgeProfile = activeProfile?.age ?? 5

  return (
    <AppContext.Provider
      value={{
        activeProfile,
        activeProfileId,
        setActiveProfileId: handleSetActiveProfileId,
        language,
        isRTL,
        setLanguage,
        sparks,
        addSparks,
        unlockedStageItems,
        unlockedBandMembers,
        newlyUnlockedBandmate,
        dismissBandmate,
        reloadProfile,
        isFirstLaunch,
        age,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
