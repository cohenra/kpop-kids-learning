// ─── Outfit Studio — customization options ────────────────────────────────────
//
// Each option has a sparkCost:
//   0 = free (available from the start)
//   > 0 = locked until the profile has accumulated that many sparks
//
// To add a new option: add an entry here — no other file needs to change.

export type HairAccessory = 'none' | 'star' | 'bow' | 'tiara' | 'crown'

export interface ColorOption {
  id: string
  color: string
  labelHe: string
  labelEn: string
  sparkCost: number
}

export interface AccessoryOption {
  id: HairAccessory
  labelHe: string
  labelEn: string
  sparkCost: number
  emoji: string
}

// ─── Hair colors ───────────────────────────────────────────────────────────────
export const HAIR_COLORS: ColorOption[] = [
  { id: 'pink',   color: '#EC4899', labelHe: 'ורוד',    labelEn: 'Pink',    sparkCost: 0   },
  { id: 'cyan',   color: '#06B6D4', labelHe: 'תכלת',   labelEn: 'Cyan',    sparkCost: 0   },
  { id: 'gold',   color: '#F59E0B', labelHe: 'זהב',     labelEn: 'Gold',    sparkCost: 50  },
  { id: 'purple', color: '#7C3AED', labelHe: 'סגול',    labelEn: 'Purple',  sparkCost: 100 },
  { id: 'green',  color: '#10B981', labelHe: 'ירוק',    labelEn: 'Green',   sparkCost: 200 },
  { id: 'white',  color: '#E2E8F0', labelHe: 'לבן',     labelEn: 'White',   sparkCost: 350 },
]

// ─── Outfit colors ─────────────────────────────────────────────────────────────
export const OUTFIT_COLORS: ColorOption[] = [
  { id: 'purple', color: '#7C3AED', labelHe: 'סגול',    labelEn: 'Purple',  sparkCost: 0   },
  { id: 'pink',   color: '#EC4899', labelHe: 'ורוד',    labelEn: 'Pink',    sparkCost: 0   },
  { id: 'cyan',   color: '#06B6D4', labelHe: 'תכלת',   labelEn: 'Cyan',    sparkCost: 75  },
  { id: 'gold',   color: '#F59E0B', labelHe: 'זהב',     labelEn: 'Gold',    sparkCost: 150 },
  { id: 'rose',   color: '#F43F5E', labelHe: 'אדום',    labelEn: 'Red',     sparkCost: 250 },
  { id: 'teal',   color: '#14B8A6', labelHe: 'ירוק-כחול', labelEn: 'Teal', sparkCost: 400 },
]

// ─── Hair accessories ──────────────────────────────────────────────────────────
export const ACCESSORIES: AccessoryOption[] = [
  { id: 'star',  labelHe: 'סיכת כוכב',   labelEn: 'Star Clip',    sparkCost: 0,   emoji: '⭐' },
  { id: 'none',  labelHe: 'ללא',           labelEn: 'None',         sparkCost: 0,   emoji: '○'  },
  { id: 'bow',   labelHe: 'קשת',           labelEn: 'Bow',          sparkCost: 80,  emoji: '🎀' },
  { id: 'tiara', labelHe: 'טיארה',         labelEn: 'Tiara',        sparkCost: 200, emoji: '✨' },
  { id: 'crown', labelHe: 'כתר מלכה',     labelEn: 'Queen Crown',  sparkCost: 500, emoji: '👑' },
]

// ─── Default outfit per profile ────────────────────────────────────────────────
export interface ProfileOutfit {
  hairColor: string
  outfitColor: string
  hairAccessory: HairAccessory
}

export function defaultOutfit(id: 1 | 2): ProfileOutfit {
  return {
    hairColor:     id === 1 ? '#EC4899' : '#06B6D4',
    outfitColor:   id === 1 ? '#7C3AED' : '#EC4899',
    hairAccessory: 'star',
  }
}
