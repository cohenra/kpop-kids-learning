// ─── Rewards data: stage items, band members, unlock thresholds ───────────────

export interface StageItem {
  id: string
  labelHe: string
  labelEn: string
  sparkCost: number
  order: number
  emoji: string
  color: string
}

export interface BandMember {
  id: string
  nameHe: string
  nameEn: string
  role: 'vocalist' | 'dancer' | 'rapper' | 'dj' | 'visual' | 'maknae'
  roleHe: string
  roleEn: string
  sparkCost: number
  order: number
  hairColor: string
  outfitColor: string
  emoji: string
}

// Cumulative unlock milestones (sparkCost is per-item, unlock checks cumulative total):
//   Floor:    50  — unlocks mid-game-1, immediate dopamine hit
//   Lighting: 150 — end of game 1 (cumulative: 150)
//   LED Wall: 300 — end of game 2 (cumulative: 300)
//   Effects:  500 — game 3-4    (cumulative: 500)
//   Curtains: 750 — game 5      (cumulative: 750)
//   Audience: 1100 — game 7-8   (cumulative: 1100)
// Target: ~1 new stage item per session to sustain engagement across multiple days.
export const STAGE_ITEMS: StageItem[] = [
  {
    id: 'floor',
    labelHe: 'רצפת הבמה',
    labelEn: 'Stage Floor',
    sparkCost: 50,
    order: 0,
    emoji: '🟣',
    color: '#7C3AED',
  },
  {
    id: 'lighting',
    labelHe: 'תאורת במה',
    labelEn: 'Stage Lighting',
    sparkCost: 100,
    order: 1,
    emoji: '💡',
    color: '#F59E0B',
  },
  {
    id: 'ledWall',
    labelHe: 'מסך LED',
    labelEn: 'LED Wall',
    sparkCost: 150,
    order: 2,
    emoji: '📺',
    color: '#06B6D4',
  },
  {
    id: 'effects',
    labelHe: 'אפקטים מיוחדים',
    labelEn: 'Special Effects',
    sparkCost: 200,
    order: 3,
    emoji: '✨',
    color: '#EC4899',
  },
  {
    id: 'curtains',
    labelHe: 'וילונות',
    labelEn: 'Curtains',
    sparkCost: 250,
    order: 4,
    emoji: '🎭',
    color: '#7C3AED',
  },
  {
    id: 'audience',
    labelHe: 'קהל',
    labelEn: 'Audience',
    sparkCost: 350,
    order: 5,
    emoji: '👥',
    color: '#EC4899',
  },
]

export const BAND_MEMBERS: BandMember[] = [
  {
    id: 'luna',
    nameHe: 'לונה',
    nameEn: 'Luna',
    role: 'vocalist',
    roleHe: 'זמרת ראשית',
    roleEn: 'Main Vocalist',
    sparkCost: 150,
    order: 0,
    hairColor: '#EC4899',
    outfitColor: '#7C3AED',
    emoji: '🎤',
  },
  {
    id: 'nova',
    nameHe: 'נובה',
    nameEn: 'Nova',
    role: 'dancer',
    roleHe: 'רקדנית ראשית',
    roleEn: 'Main Dancer',
    sparkCost: 180,
    order: 1,
    hairColor: '#06B6D4',
    outfitColor: '#EC4899',
    emoji: '💃',
  },
  {
    id: 'star',
    nameHe: 'סטאר',
    nameEn: 'Star',
    role: 'rapper',
    roleHe: 'רפרית',
    roleEn: 'Rapper',
    sparkCost: 210,
    order: 2,
    hairColor: '#F59E0B',
    outfitColor: '#06B6D4',
    emoji: '🎵',
  },
  {
    id: 'pixel',
    nameHe: 'פיקסל',
    nameEn: 'Pixel',
    role: 'dj',
    roleHe: "די'ג'יי",
    roleEn: 'DJ',
    sparkCost: 240,
    order: 3,
    hairColor: '#7C3AED',
    outfitColor: '#F59E0B',
    emoji: '🎧',
  },
  {
    id: 'aria',
    nameHe: 'אריה',
    nameEn: 'Aria',
    role: 'visual',
    roleHe: 'ויזואל',
    roleEn: 'Visual',
    sparkCost: 270,
    order: 4,
    hairColor: '#EC4899',
    outfitColor: '#06B6D4',
    emoji: '💫',
  },
  {
    id: 'kiki',
    nameHe: "קיקי",
    nameEn: 'Kiki',
    role: 'maknae',
    roleHe: 'מקנה (הכי צעירה)',
    roleEn: 'Maknae',
    sparkCost: 300,
    order: 5,
    hairColor: '#F59E0B',
    outfitColor: '#EC4899',
    emoji: '🌟',
  },
]

export const TOTAL_STAGE_SPARKS = STAGE_ITEMS.reduce((sum, item) => sum + item.sparkCost, 0)
export const TOTAL_BAND_SPARKS = BAND_MEMBERS.reduce((sum, m) => sum + m.sparkCost, 0)

// ── Bandmate unlock thresholds ────────────────────────────────────────────────
// Each entry: { memberId, gamesRequired }
// Kiki (index 5) requires stage complete — represented as gamesRequired = Infinity
export const BANDMATE_THRESHOLDS: { memberId: string; gamesRequired: number }[] = [
  { memberId: 'luna',  gamesRequired: 2  },
  { memberId: 'nova',  gamesRequired: 5  },
  { memberId: 'star',  gamesRequired: 10 },
  { memberId: 'pixel', gamesRequired: 15 },
  { memberId: 'aria',  gamesRequired: 20 },
  { memberId: 'kiki',  gamesRequired: Infinity }, // requires full stage
]

export function getUnlockedStageItems(sparks: number, alreadyUnlocked: string[]): string[] {
  const unlocked = [...alreadyUnlocked]
  // Items unlock in order, gated by cumulative sparks
  let cumulative = 0
  for (const item of STAGE_ITEMS) {
    cumulative += item.sparkCost
    if (sparks >= cumulative && !unlocked.includes(item.id)) {
      unlocked.push(item.id)
    }
  }
  return unlocked
}

// ── Unified unlock check (pure function — no I/O) ────────────────────────────
//
// Called from AppContext.addSparks after every spark update.
// Returns the new full unlock state. AppContext applies whatever changed.
// To add a new reward type: add its logic here + return it in UnlockResult.
//
// Flow:
//   sparks + gamesCompleted → checkAllUnlocks() → { stageItems, bandMembers, changed }
//                                                       ↓
//                                               AppContext applies + saves

export interface UnlockState {
  stageItems: string[]
  bandMembers: string[]
}

export interface UnlockResult extends UnlockState {
  changed: boolean
  newlyUnlockedBandmate: BandMember | null
}

export function checkAllUnlocks(
  sparks: number,
  gamesCompleted: number,
  current: UnlockState,
): UnlockResult {
  // ── Stage items ─────────────────────────────────────────────────────────────
  const newStageItems = getUnlockedStageItems(sparks, current.stageItems)
  const stageComplete = newStageItems.length >= STAGE_ITEMS.length

  // ── Band members ─────────────────────────────────────────────────────────────
  const newBandMembers = [...current.bandMembers]
  let newlyUnlockedBandmate: BandMember | null = null

  for (const threshold of BANDMATE_THRESHOLDS) {
    if (newBandMembers.includes(threshold.memberId)) continue
    const shouldUnlock =
      threshold.gamesRequired === Infinity
        ? stageComplete
        : gamesCompleted >= threshold.gamesRequired
    if (shouldUnlock) {
      newBandMembers.push(threshold.memberId)
      // Track the first newly unlocked member for celebration
      if (!newlyUnlockedBandmate) {
        newlyUnlockedBandmate = BAND_MEMBERS.find((m) => m.id === threshold.memberId) ?? null
      }
    }
  }

  const changed =
    newStageItems.length !== current.stageItems.length ||
    newBandMembers.length !== current.bandMembers.length

  return { stageItems: newStageItems, bandMembers: newBandMembers, changed, newlyUnlockedBandmate }
}

export function getNextStageItem(unlockedIds: string[]): StageItem | null {
  return STAGE_ITEMS.find((item) => !unlockedIds.includes(item.id)) ?? null
}

export function getSparksForNextItem(sparks: number, unlockedIds: string[]): number {
  const next = getNextStageItem(unlockedIds)
  if (!next) return 0
  // Calculate cumulative cost up to this item
  let cumulative = 0
  for (const item of STAGE_ITEMS) {
    cumulative += item.sparkCost
    if (item.id === next.id) break
  }
  return Math.max(0, cumulative - sparks)
}
