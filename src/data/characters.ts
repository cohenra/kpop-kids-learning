// ─── Character outfit / accessory data ────────────────────────────────────────

export interface Outfit {
  id: string
  nameHe: string
  nameEn: string
  sparkCost: number
  primaryColor: string
  accentColor: string
  description: string
}

export interface Accessory {
  id: string
  nameHe: string
  nameEn: string
  sparkCost: number
  type: 'hair' | 'headwear' | 'necklace' | 'earrings'
  color: string
}

export const OUTFITS: Outfit[] = [
  {
    id: 'default',
    nameHe: 'תלבושת בסיסית',
    nameEn: 'Starter Outfit',
    sparkCost: 0,
    primaryColor: '#7C3AED',
    accentColor: '#EC4899',
    description: 'Your starting look!',
  },
  {
    id: 'galaxy',
    nameHe: 'שמלת גלקסיה',
    nameEn: 'Galaxy Dress',
    sparkCost: 50,
    primaryColor: '#1E1B2E',
    accentColor: '#06B6D4',
    description: 'Sparkly galaxy vibes!',
  },
  {
    id: 'neon',
    nameHe: 'תלבושת ניאון',
    nameEn: 'Neon Outfit',
    sparkCost: 100,
    primaryColor: '#EC4899',
    accentColor: '#F59E0B',
    description: 'Bright neon colors!',
  },
  {
    id: 'concert',
    nameHe: 'תלבושת קונצרט',
    nameEn: 'Concert Stage Outfit',
    sparkCost: 200,
    primaryColor: '#F59E0B',
    accentColor: '#7C3AED',
    description: 'Ready for the big stage!',
  },
]

export const ACCESSORIES: Accessory[] = [
  {
    id: 'star_clip',
    nameHe: 'סיכת כוכב',
    nameEn: 'Star Hair Clip',
    sparkCost: 30,
    type: 'hair',
    color: '#F59E0B',
  },
  {
    id: 'crown',
    nameHe: 'כתר',
    nameEn: 'Crown',
    sparkCost: 80,
    type: 'headwear',
    color: '#F59E0B',
  },
  {
    id: 'star_necklace',
    nameHe: 'שרשרת כוכב',
    nameEn: 'Star Necklace',
    sparkCost: 40,
    type: 'necklace',
    color: '#06B6D4',
  },
]
