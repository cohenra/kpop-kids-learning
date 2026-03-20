// ─── Typed LocalStorage helpers ───────────────────────────────────────────────

export type AgeProfile = 3 | 5

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

function loadRoot(): AppStorage {
  if (_cache) return _cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    _cache = raw ? (JSON.parse(raw) as AppStorage) : createDefaultStorage()
  } catch {
    _cache = createDefaultStorage()
  }
  return _cache
}

function saveRoot(data: AppStorage): void {
  _cache = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
  return loadRoot().gameProgress[profileId]
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
