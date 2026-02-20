import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import {
  createProfile,
  saveProfile,
  getProfile,
  resetProfileProgress,
} from '../utils/storage'
import type { AgeProfile, Profile } from '../utils/storage'
import type { Language } from '../i18n/strings'

// ─── useProfile: profile management operations ────────────────────────────────

interface UseProfileReturn {
  activeProfile: Profile | null
  createNewProfile: (
    id: 1 | 2,
    name: string,
    age: AgeProfile,
    lang: Language
  ) => Profile
  switchProfile: (id: 1 | 2) => void
  updateName: (name: string) => void
  updateAge: (age: AgeProfile) => void
  resetProgress: () => void
  getProfileById: (id: 1 | 2) => Profile | null
}

export function useProfile(): UseProfileReturn {
  const { activeProfile, activeProfileId, setActiveProfileId, reloadProfile } =
    useApp()

  const createNewProfile = useCallback(
    (id: 1 | 2, name: string, age: AgeProfile, lang: Language): Profile => {
      const profile = createProfile(id, name, age, lang)
      setActiveProfileId(id)
      return profile
    },
    [setActiveProfileId]
  )

  const switchProfile = useCallback(
    (id: 1 | 2) => {
      setActiveProfileId(id)
    },
    [setActiveProfileId]
  )

  const updateName = useCallback(
    (name: string) => {
      if (!activeProfile) return
      const updated: Profile = { ...activeProfile, characterName: name }
      saveProfile(updated)
      reloadProfile()
    },
    [activeProfile, reloadProfile]
  )

  const updateAge = useCallback(
    (age: AgeProfile) => {
      if (!activeProfile) return
      const updated: Profile = { ...activeProfile, age }
      saveProfile(updated)
      reloadProfile()
    },
    [activeProfile, reloadProfile]
  )

  const resetProgress = useCallback(() => {
    resetProfileProgress(activeProfileId)
    reloadProfile()
  }, [activeProfileId, reloadProfile])

  const getProfileById = useCallback((id: 1 | 2): Profile | null => {
    return getProfile(id)
  }, [])

  return {
    activeProfile,
    createNewProfile,
    switchProfile,
    updateName,
    updateAge,
    resetProgress,
    getProfileById,
  }
}
