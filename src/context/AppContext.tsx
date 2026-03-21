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
  getProfileOutfit,
  saveProfileOutfit,
} from '../utils/storage'
import { checkAllUnlocks } from '../data/rewards'
import { defaultOutfit, type ProfileOutfit } from '../data/outfitItems'
import type { Language } from '../i18n/strings'
import type { BandMember } from '../data/rewards'

// ─── Types ────────────────────────────────────────────────────────────────────

/** Derived profile avatar colors — reflects current outfit customisation. */
export interface ProfileColors {
  hair: string
  outfit: string
}

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

  // Outfit Studio customisation
  outfit: ProfileOutfit
  updateOutfit: (patch: Partial<ProfileOutfit>) => void

  // Derived — avoids repeating in every component
  profileColors: ProfileColors
  backArrow: string
}

const AppContext = createContext<AppContextValue | null>(null)

// computeUnlockedBandmates removed — logic lives in rewards.ts checkAllUnlocks()

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

  // Outfit customisation — falls back to per-profile defaults if not yet set
  const [outfit, setOutfitState] = useState<ProfileOutfit>(
    () => getProfileOutfit(getActiveProfileId()) ?? defaultOutfit(getActiveProfileId())
  )

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
      setOutfitState(getProfileOutfit(activeProfileId) ?? defaultOutfit(activeProfileId))
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
      setOutfitState(getProfileOutfit(id) ?? defaultOutfit(id))
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

      // Delegate all unlock logic to the pure function in rewards.ts.
      // To add new reward types, extend checkAllUnlocks — not this function.
      const gamesCompleted = getGameProgress(activeProfileId).filter((p) => p.completed).length
      const result = checkAllUnlocks(newTotal, gamesCompleted, {
        stageItems: unlockedStageItems,
        bandMembers: unlockedBandMembers,
      })

      if (result.changed) {
        if (result.stageItems.length !== unlockedStageItems.length) {
          setUnlockedStageItems(result.stageItems)
          updateProfileStageItems(activeProfileId, result.stageItems)
        }
        if (result.bandMembers.length !== unlockedBandMembers.length) {
          setUnlockedBandMembers(result.bandMembers)
          updateProfileBandMembers(activeProfileId, result.bandMembers)
          if (result.newlyUnlockedBandmate) {
            setNewlyUnlockedBandmate(result.newlyUnlockedBandmate)
          }
        }
      }
    },
    [activeProfile, activeProfileId, sparks, unlockedStageItems, unlockedBandMembers]
  )

  const dismissBandmate = useCallback(() => {
    setNewlyUnlockedBandmate(null)
  }, [])

  const updateOutfit = useCallback(
    (patch: Partial<ProfileOutfit>) => {
      const updated: ProfileOutfit = { ...outfit, ...patch }
      setOutfitState(updated)
      saveProfileOutfit(activeProfileId, updated)
    },
    [outfit, activeProfileId]
  )

  const age: AgeProfile = activeProfile?.age ?? 5

  // profileColors now reflects the player's chosen outfit customisation
  const profileColors: ProfileColors = {
    hair:   outfit.hairColor,
    outfit: outfit.outfitColor,
  }

  const backArrow = isRTL ? '→' : '←'

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
        outfit,
        updateOutfit,
        profileColors,
        backArrow,
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
