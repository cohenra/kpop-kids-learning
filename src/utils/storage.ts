// ─── Typed LocalStorage helpers ───────────────────────────────────────────────

export type AgeProfile = 3 | 5

// ─── Daily mission per-profile state ──────────────────────────────────────────
export interface DailyMissionState {
  dateKey: string      // 'YYYY-MM-DD' in local TZ — identifies the day
  missions: Array<{
    missionId: string
    bonusGiven: boolean
  }>
}

// ─── Band outfit customization per-profile ─────────────────────────────────────
export interface BandOutfitColors {
  hairColor: string
  outfitColor: string
}

export interface Profile {
  id: 1 | 2
  characterName: string
  age: AgeProfile
  language: 'he' | 'en'
  sparks: number
  unlockedStageItems: string[]
  unlockedBandMembers: string[]
  createdAt: number
  lastPlayed: number
  // Optional — added in v2; migrated on load for existing profiles
  dailyMission?: DailyMissionState | null
  // Optional — added in v3; Outfit Studio customisation
  outfit?: import('../data/outfitItems').ProfileOutfit | null
  // Optional — added in v4; Song Studio — last built song
  builtSong?: import('../data/songStudio').BuiltSong | null
  // Optional — added in v5; Band member outfit customization
  bandOutfits?: Record<string, BandOutfitColors> | null
}

export interface GameProgress {
  roomId: string
  gameId: string
  completed: boolean
  highScore: number
  timesPlayed: number
  lastPlayed: number
}

export interface AppStorage {
  profiles: { 1: Profile | null; 2: Profile | null }
  activeProfileId: 1 | 2
  parentPin: string | null
  roomLocks: Record<string, boolean>
  gameProgress: { 1: GameProgress[]; 2: GameProgress[] }
}

const STORAGE_KEY = 'star-academy'

// Write-through cache: one JSON parse on first load, zero after that.
// Every write goes through saveRoot which updates the cache atomically.
let _cache: AppStorage | null = null

// ─── Profile migration ─────────────────────────────────────────────────────────
// Spread defaults BEFORE the raw object so existing fields always win.
// Add new optional Profile fields here with their default values.
function migrateProfile(raw: Profile): Profile {
  return {
    dailyMission: null,
    bandOutfits: null,
    ...raw,
  }
}

// ─── Root storage migration ────────────────────────────────────────────────────
// Ensures fields added after initial release always exist in loaded data.
// New root-level fields must be listed here with safe fallback values.
function migrateRoot(raw: AppStorage): AppStorage {
  // Ensure gameProgress sub-arrays are always real arrays (guarding against
  // old localStorage snapshots where gameProgress was missing or malformed).
  const safeGameProgress: AppStorage['gameProgress'] = {
    1: Array.isArray(raw.gameProgress?.[1]) ? raw.gameProgress![1] : [],
    2: Array.isArray(raw.gameProgress?.[2]) ? raw.gameProgress![2] : [],
  }

  // Ensure profiles always has both keys (guards against corrupted/missing storage)
  const safeProfiles: AppStorage['profiles'] = {
    1: (raw.profiles as AppStorage['profiles'] | undefined)?.[1] ?? null,
    2: (raw.profiles as AppStorage['profiles'] | undefined)?.[2] ?? null,
  }

  return {
    parentPin:      raw.parentPin      ?? null,
    roomLocks:      raw.roomLocks      ?? {},
    profiles:       safeProfiles,
    activeProfileId: (raw.activeProfileId === 1 || raw.activeProfileId === 2)
      ? raw.activeProfileId
      : 1,
    gameProgress: safeGameProgress,
  }
}

function loadRoot(): AppStorage {
  if (_cache) return _cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppStorage
      // Migrate root-level fields (new fields added over time)
      const migrated = migrateRoot(parsed)
      // Migrate each profile that exists
      if (migrated.profiles[1]) migrated.profiles[1] = migrateProfile(migrated.profiles[1])
      if (migrated.profiles[2]) migrated.profiles[2] = migrateProfile(migrated.profiles[2])
      _cache = migrated
    } else {
      _cache = createDefaultStorage()
    }
  } catch {
    _cache = createDefaultStorage()
  }
  // _cache is always set by the branches above — this is a safety fallback.
  return _cache ?? createDefaultStorage()
}

function saveRoot(data: AppStorage): void {
  _cache = data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // QuotaExceededError — localStorage is full. In-memory cache still works
    // for the session, but warn so the parent can investigate in DevTools.
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.warn('[storage] QuotaExceededError — localStorage is full. Progress may not persist.')
    }
  }
}

function createDefaultStorage(): AppStorage {
  return {
    profiles: { 1: null, 2: null },
    activeProfileId: 1,
    parentPin: null,
    roomLocks: {},
    gameProgress: { 1: [], 2: [] },
  }
}

// ─── Profile helpers ───────────────────────────────────────────────────────────

export function getProfile(id: 1 | 2): Profile | null {
  return loadRoot().profiles[id]
}

export function saveProfile(profile: Profile): void {
  const data = loadRoot()
  data.profiles[profile.id] = profile
  saveRoot(data)
}

export function getActiveProfileId(): 1 | 2 {
  return loadRoot().activeProfileId
}

export function setActiveProfileId(id: 1 | 2): void {
  const data = loadRoot()
  data.activeProfileId = id
  saveRoot(data)
}

export function hasAnyProfile(): boolean {
  const data = loadRoot()
  return data.profiles[1] !== null || data.profiles[2] !== null
}

export function createProfile(
  id: 1 | 2,
  characterName: string,
  age: AgeProfile,
  language: 'he' | 'en'
): Profile {
  const profile: Profile = {
    id,
    characterName,
    age,
    language,
    sparks: 0,
    unlockedStageItems: [],
    unlockedBandMembers: [],
    createdAt: Date.now(),
    lastPlayed: Date.now(),
  }
  saveProfile(profile)
  return profile
}

export function updateProfileSparks(id: 1 | 2, newTotal: number): void {
  const data = loadRoot()
  if (data.profiles[id]) {
    data.profiles[id]!.sparks = newTotal
    data.profiles[id]!.lastPlayed = Date.now()
    saveRoot(data)
  }
}

export function updateProfileStageItems(id: 1 | 2, items: string[]): void {
  const data = loadRoot()
  if (data.profiles[id]) {
    data.profiles[id]!.unlockedStageItems = items
    saveRoot(data)
  }
}

export function updateProfileBandMembers(id: 1 | 2, members: string[]): void {
  const data = loadRoot()
  if (data.profiles[id]) {
    data.profiles[id]!.unlockedBandMembers = members
    saveRoot(data)
  }
}

// ─── Game progress helpers ─────────────────────────────────────────────────────

export function getGameProgress(profileId: 1 | 2): GameProgress[] {
  return loadRoot().gameProgress[profileId] ?? []
}

export function saveGameProgress(profileId: 1 | 2, progress: GameProgress): void {
  const data = loadRoot()
  const list = data.gameProgress[profileId]
  const idx = list.findIndex(
    (p) => p.roomId === progress.roomId && p.gameId === progress.gameId
  )
  if (idx >= 0) {
    list[idx] = progress
  } else {
    list.push(progress)
  }
  data.gameProgress[profileId] = list
  saveRoot(data)
}

// ─── Parent mode helpers ───────────────────────────────────────────────────────

export function getParentPin(): string | null {
  return loadRoot().parentPin
}

export function setParentPin(pin: string): void {
  const data = loadRoot()
  data.parentPin = pin
  saveRoot(data)
}

export function getRoomLocks(): Record<string, boolean> {
  return loadRoot().roomLocks
}

export function setRoomLock(roomId: string, locked: boolean): void {
  const data = loadRoot()
  data.roomLocks[roomId] = locked
  saveRoot(data)
}

// ─── Song Studio helpers ───────────────────────────────────────────────────────

export function getBuiltSong(
  profileId: 1 | 2
): import('../data/songStudio').BuiltSong | null {
  return loadRoot().profiles[profileId]?.builtSong ?? null
}

export function saveBuiltSong(
  profileId: 1 | 2,
  song: import('../data/songStudio').BuiltSong
): void {
  const data = loadRoot()
  if (data.profiles[profileId]) {
    data.profiles[profileId]!.builtSong = song
    saveRoot(data)
  }
}

// ─── Outfit helpers ────────────────────────────────────────────────────────────

export function getProfileOutfit(
  profileId: 1 | 2
): import('../data/outfitItems').ProfileOutfit | null {
  return loadRoot().profiles[profileId]?.outfit ?? null
}

export function saveProfileOutfit(
  profileId: 1 | 2,
  outfit: import('../data/outfitItems').ProfileOutfit
): void {
  const data = loadRoot()
  if (data.profiles[profileId]) {
    data.profiles[profileId]!.outfit = outfit
    saveRoot(data)
  }
}

// ─── Daily mission helpers ─────────────────────────────────────────────────────

export function getDailyMission(profileId: 1 | 2): DailyMissionState | null {
  return loadRoot().profiles[profileId]?.dailyMission ?? null
}

export function saveDailyMission(profileId: 1 | 2, state: DailyMissionState): void {
  const data = loadRoot()
  if (data.profiles[profileId]) {
    data.profiles[profileId]!.dailyMission = state
    saveRoot(data)
  }
}

// ─── Band outfit helpers ───────────────────────────────────────────────────────

export function getBandOutfits(profileId: 1 | 2): Record<string, BandOutfitColors> {
  return loadRoot().profiles[profileId]?.bandOutfits ?? {}
}

export function saveBandOutfit(
  profileId: 1 | 2,
  memberId: string,
  colors: BandOutfitColors
): void {
  const data = loadRoot()
  if (data.profiles[profileId]) {
    const current = data.profiles[profileId]!.bandOutfits ?? {}
    data.profiles[profileId]!.bandOutfits = { ...current, [memberId]: colors }
    saveRoot(data)
  }
}

// ─── Full reset ────────────────────────────────────────────────────────────────

export function resetProfileProgress(id: 1 | 2): void {
  const data = loadRoot()
  if (data.profiles[id]) {
    data.profiles[id]!.sparks = 0
    data.profiles[id]!.unlockedStageItems = []
    data.profiles[id]!.unlockedBandMembers = []
    data.gameProgress[id] = []
    saveRoot(data)
  }
}
