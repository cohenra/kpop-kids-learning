// ─── Logic Room Data ──────────────────────────────────────────────────────────
//
// Challenge Room — "Pre-Show Puzzle"
// 4 games: Jigsaw Puzzle, Odd One Out, Shadow Match, Memory Cards

export type AgeProfile = 3 | 5

export const PUZZLE_COMPLETION_SPARKS = 40
export const ODDONE_SPARKS_PER_ROUND = 10
export const ODDONE_COMPLETION_BONUS = 30
export const SHADOW_SPARKS_PER_ROUND = 10
export const SHADOW_COMPLETION_BONUS = 30
export const MEMORY_COMPLETION_SPARKS = 50

// ─── Utilities ────────────────────────────────────────────────────────────────

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Jigsaw Puzzle ────────────────────────────────────────────────────────────

// 6 K-POP themed puzzle images (described as SVG scenes, rendered inline)
export interface PuzzleScene {
  id: string
  titleHe: string
  titleEn: string
  // Background gradient for the full image
  bgFrom: string
  bgTo: string
  // Central emoji that is shown large in the assembled image
  emoji: string
  // Secondary decorative emojis arranged around it
  decos: string[]
}

export const PUZZLE_SCENES: PuzzleScene[] = [
  {
    id: 'concert',
    titleHe: 'קונצרט',
    titleEn: 'Concert',
    bgFrom: '#1E1B2E', bgTo: '#2D1B4E',
    emoji: '🎤',
    decos: ['✨', '⭐', '🎵', '💫'],
  },
  {
    id: 'star',
    titleHe: 'כוכבת',
    titleEn: 'Pop Star',
    bgFrom: '#2D1B4E', bgTo: '#1E1B2E',
    emoji: '💃',
    decos: ['🌟', '🎀', '✨', '👑'],
  },
  {
    id: 'stage',
    titleHe: 'במה',
    titleEn: 'Stage',
    bgFrom: '#0D0B1A', bgTo: '#1E1B2E',
    emoji: '🎭',
    decos: ['🎸', '🎶', '💡', '🎹'],
  },
  {
    id: 'rainbow',
    titleHe: 'קשת',
    titleEn: 'Rainbow',
    bgFrom: '#EC4899', bgTo: '#7C3AED',
    emoji: '🌈',
    decos: ['⭐', '💫', '🌟', '✨'],
  },
  {
    id: 'microphone',
    titleHe: 'מיקרופון',
    titleEn: 'Microphone',
    bgFrom: '#06B6D4', bgTo: '#7C3AED',
    emoji: '🎤',
    decos: ['🎵', '🎶', '🎼', '🎸'],
  },
  {
    id: 'crown',
    titleHe: 'כתר',
    titleEn: 'Crown',
    bgFrom: '#F59E0B', bgTo: '#EC4899',
    emoji: '👑',
    decos: ['💎', '✨', '⭐', '🌟'],
  },
]

// Pieces count by age
export function getPieceCount(age: AgeProfile): number {
  return age === 3 ? 4 : 9
}

// Grid dimensions
export function getGridDims(age: AgeProfile): { cols: number; rows: number } {
  return age === 3
    ? { cols: 2, rows: 2 }
    : { cols: 3, rows: 3 }
}

// A piece has a position in the final grid + a random tray position
export interface Piece {
  id: number            // 0-indexed
  correctCol: number
  correctRow: number
  placedCol: number | null   // null = in tray
  placedRow: number | null
}

export function buildPieces(age: AgeProfile): Piece[] {
  const { cols, rows } = getGridDims(age)
  const pieces: Piece[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pieces.push({
        id: r * cols + c,
        correctCol: c,
        correctRow: r,
        placedCol: null,
        placedRow: null,
      })
    }
  }
  return shuffle(pieces)
}

// ─── Odd One Out ──────────────────────────────────────────────────────────────

export interface OddOneOutRound {
  items: string[]        // 4 emojis: 3 belong, 1 is odd
  oddIndex: number       // which one is the odd one
  categoryHe: string     // "בעלי חיים" etc.
  categoryEn: string
  ttsHe: string
  ttsEn: string
}

// Age 3: obvious groupings. Age 5: more subtle.
const ROUNDS_AGE3: OddOneOutRound[] = [
  { items: ['🐶','🐱','🐭','🚗'], oddIndex: 3, categoryHe: 'בעלי חיים', categoryEn: 'Animals',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🍕','🍔','🌭','✏️'], oddIndex: 3, categoryHe: 'אוכל', categoryEn: 'Food',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🔴','🔵','🟢','🐸'], oddIndex: 3, categoryHe: 'צבעים', categoryEn: 'Colors',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['👕','👖','🧢','🏀'], oddIndex: 3, categoryHe: 'בגדים', categoryEn: 'Clothes',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🚗','🚕','🚙','🍎'], oddIndex: 3, categoryHe: 'כלי רכב', categoryEn: 'Vehicles',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🎹','🎸','🎵','🐦'], oddIndex: 3, categoryHe: 'כלי נגינה', categoryEn: 'Instruments',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🐄','🐑','🐴','✈️'], oddIndex: 3, categoryHe: 'חיות חווה', categoryEn: 'Farm Animals',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🍓','🍊','🍋','🥕'], oddIndex: 3, categoryHe: 'פירות', categoryEn: 'Fruits',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['⭕','🔺','🔶','🐠'], oddIndex: 3, categoryHe: 'צורות', categoryEn: 'Shapes',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🌧️','⛅','☀️','🐟'], oddIndex: 3, categoryHe: 'מזג אוויר', categoryEn: 'Weather',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
]

const ROUNDS_AGE5: OddOneOutRound[] = [
  { items: ['🦅','🦜','🦋','🐟'], oddIndex: 3, categoryHe: 'דברים שעפים', categoryEn: 'Things that fly',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🎸','🎹','🥁','📺'], oddIndex: 3, categoryHe: 'כלי נגינה', categoryEn: 'Instruments',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🍊','🍋','🍈','🍓'], oddIndex: 3, categoryHe: 'פירות הדר', categoryEn: 'Citrus fruits',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🐳','🐬','🦈','🦅'], oddIndex: 3, categoryHe: 'חיות ים', categoryEn: 'Sea animals',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🚀','✈️','🚁','🚗'], oddIndex: 3, categoryHe: 'דברים שעפים', categoryEn: 'Things that fly',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🔴','🟠','🟡','🔵'], oddIndex: 3, categoryHe: 'צבעי קשת', categoryEn: 'Rainbow colors (cool)',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🦁','🐯','🐆','🐧'], oddIndex: 3, categoryHe: 'חיות ג׳ונגל', categoryEn: 'Jungle animals',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🥦','🥕','🌽','🍎'], oddIndex: 3, categoryHe: 'ירקות', categoryEn: 'Vegetables',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['🎤','🎵','🎼','📐'], oddIndex: 3, categoryHe: 'מוזיקה', categoryEn: 'Music',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
  { items: ['⛵','🚢','🛶','🚂'], oddIndex: 3, categoryHe: 'כלי שייט', categoryEn: 'Boats',
    ttsHe: 'מה לא שייך לקבוצה?', ttsEn: 'Which one does not belong?' },
]

export function getOddOneOutRounds(age: AgeProfile): OddOneOutRound[] {
  const pool = age === 3 ? ROUNDS_AGE3 : ROUNDS_AGE5
  return shuffle(pool).slice(0, 10)
}

// ─── Shadow Match ─────────────────────────────────────────────────────────────

export interface ShadowRound {
  target: string      // The colored emoji shown at top
  options: string[]   // All silhouette options (all same emoji rendered differently)
  // For shadow match we use the same emoji but highlight correct one
  correctIndex: number
  labelHe: string
  labelEn: string
  ttsHe: string
  ttsEn: string
}

// Age 3: 2 options, simple. Age 5: 4 options, similar-looking objects
const SHADOW_ROUNDS_AGE3: ShadowRound[] = [
  { target: '⭐', options: ['⭐','🔶'], correctIndex: 0, labelHe: 'כוכב', labelEn: 'Star',
    ttsHe: 'איזה צל מתאים לכוכב?', ttsEn: 'Which shadow matches the star?' },
  { target: '❤️', options: ['❤️','🔷'], correctIndex: 0, labelHe: 'לב', labelEn: 'Heart',
    ttsHe: 'איזה צל מתאים ללב?', ttsEn: 'Which shadow matches the heart?' },
  { target: '🎤', options: ['🎤','🎸'], correctIndex: 0, labelHe: 'מיקרופון', labelEn: 'Microphone',
    ttsHe: 'איזה צל מתאים למיקרופון?', ttsEn: 'Which shadow matches the microphone?' },
  { target: '🌙', options: ['🌙','☀️'], correctIndex: 0, labelHe: 'ירח', labelEn: 'Moon',
    ttsHe: 'איזה צל מתאים לירח?', ttsEn: 'Which shadow matches the moon?' },
  { target: '🎵', options: ['🎵','🎶'], correctIndex: 0, labelHe: 'תו', labelEn: 'Note',
    ttsHe: 'איזה צל מתאים לתו?', ttsEn: 'Which shadow matches the note?' },
  { target: '👑', options: ['👑','🎩'], correctIndex: 0, labelHe: 'כתר', labelEn: 'Crown',
    ttsHe: 'איזה צל מתאים לכתר?', ttsEn: 'Which shadow matches the crown?' },
  { target: '🏠', options: ['🏠','🏢'], correctIndex: 0, labelHe: 'בית', labelEn: 'House',
    ttsHe: 'איזה צל מתאים לבית?', ttsEn: 'Which shadow matches the house?' },
  { target: '🌈', options: ['🌈','⛅'], correctIndex: 0, labelHe: 'קשת', labelEn: 'Rainbow',
    ttsHe: 'איזה צל מתאים לקשת?', ttsEn: 'Which shadow matches the rainbow?' },
  { target: '🎸', options: ['🎸','🥁'], correctIndex: 0, labelHe: 'גיטרה', labelEn: 'Guitar',
    ttsHe: 'איזה צל מתאים לגיטרה?', ttsEn: 'Which shadow matches the guitar?' },
  { target: '🦋', options: ['🦋','🐝'], correctIndex: 0, labelHe: 'פרפר', labelEn: 'Butterfly',
    ttsHe: 'איזה צל מתאים לפרפר?', ttsEn: 'Which shadow matches the butterfly?' },
]

const SHADOW_ROUNDS_AGE5: ShadowRound[] = [
  { target: '🎸', options: ['🎸','🎹','🥁','🎺'], correctIndex: 0, labelHe: 'גיטרה', labelEn: 'Guitar',
    ttsHe: 'איזה צל מתאים לגיטרה?', ttsEn: 'Which shadow matches the guitar?' },
  { target: '🎹', options: ['🎺','🎹','🎸','🥁'], correctIndex: 1, labelHe: 'פסנתר', labelEn: 'Piano',
    ttsHe: 'איזה צל מתאים לפסנתר?', ttsEn: 'Which shadow matches the piano?' },
  { target: '🥁', options: ['🎸','🎺','🥁','🎹'], correctIndex: 2, labelHe: 'תוף', labelEn: 'Drum',
    ttsHe: 'איזה צל מתאים לתוף?', ttsEn: 'Which shadow matches the drum?' },
  { target: '🎺', options: ['🎹','🥁','🎸','🎺'], correctIndex: 3, labelHe: 'חצוצרה', labelEn: 'Trumpet',
    ttsHe: 'איזה צל מתאים לחצוצרה?', ttsEn: 'Which shadow matches the trumpet?' },
  { target: '🦁', options: ['🐯','🦁','🐆','🐻'], correctIndex: 1, labelHe: 'אריה', labelEn: 'Lion',
    ttsHe: 'איזה צל מתאים לאריה?', ttsEn: 'Which shadow matches the lion?' },
  { target: '🌻', options: ['🌹','🌷','🌻','🌸'], correctIndex: 2, labelHe: 'חמנייה', labelEn: 'Sunflower',
    ttsHe: 'איזה צל מתאים לחמנייה?', ttsEn: 'Which shadow matches the sunflower?' },
  { target: '🏆', options: ['🏆','🎖️','🥇','🎗️'], correctIndex: 0, labelHe: 'גביע', labelEn: 'Trophy',
    ttsHe: 'איזה צל מתאים לגביע?', ttsEn: 'Which shadow matches the trophy?' },
  { target: '🚀', options: ['✈️','🚁','🛸','🚀'], correctIndex: 3, labelHe: 'רקטה', labelEn: 'Rocket',
    ttsHe: 'איזה צל מתאים לרקטה?', ttsEn: 'Which shadow matches the rocket?' },
  { target: '🦅', options: ['🦅','🦜','🐦','🦆'], correctIndex: 0, labelHe: 'נשר', labelEn: 'Eagle',
    ttsHe: 'איזה צל מתאים לנשר?', ttsEn: 'Which shadow matches the eagle?' },
  { target: '🎻', options: ['🎸','🎻','🪕','🎹'], correctIndex: 1, labelHe: 'כינור', labelEn: 'Violin',
    ttsHe: 'איזה צל מתאים לכינור?', ttsEn: 'Which shadow matches the violin?' },
]

export function getShadowRounds(age: AgeProfile): ShadowRound[] {
  const pool = age === 3 ? SHADOW_ROUNDS_AGE3 : SHADOW_ROUNDS_AGE5
  return shuffle(pool).slice(0, 10)
}

// ─── Memory Cards ─────────────────────────────────────────────────────────────

// K-POP themed emoji pairs
const MEMORY_EMOJIS_POOL = [
  '🎤','⭐','🎵','💫','🎀','👑','🌟','🎶',
  '🎸','🎧','💃','🎹','🎭','✨','🎺','🥁',
]

export interface MemoryCard {
  id: number       // unique card id
  pairId: number   // which emoji pair
  emoji: string
  flipped: boolean
  matched: boolean
}

export function buildMemoryCards(age: AgeProfile): MemoryCard[] {
  const pairCount = age === 3 ? 4 : 8
  const emojis = MEMORY_EMOJIS_POOL.slice(0, pairCount)
  const cards: MemoryCard[] = []

  emojis.forEach((emoji, pairId) => {
    cards.push({ id: pairId * 2,     pairId, emoji, flipped: false, matched: false })
    cards.push({ id: pairId * 2 + 1, pairId, emoji, flipped: false, matched: false })
  })

  return shuffle(cards)
}

export function getMemoryGridDims(age: AgeProfile): { cols: number; rows: number } {
  return age === 3
    ? { cols: 4, rows: 2 }   // 4×2 = 8 cards (4 pairs)
    : { cols: 4, rows: 4 }   // 4×4 = 16 cards (8 pairs)
}
