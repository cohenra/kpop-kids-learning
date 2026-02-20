// ─── Math Room Data ───────────────────────────────────────────────────────────
//
// All content for the 4 math games (Recording Studio / Beat & Numbers)
// Supports age 3 and age 5, Hebrew and English.

export type Language = 'he' | 'en'
export type AgeProfile = 3 | 5

// ─── Shared constants ─────────────────────────────────────────────────────────

export const SPARKS_PER_ROUND = 10
export const SPARKS_COMPLETION_BONUS = 50
export const ROUNDS_PER_GAME = 10

// ─── Utilities ────────────────────────────────────────────────────────────────

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

// ─── Number words ─────────────────────────────────────────────────────────────

const HE_NUMBERS: Record<number, string> = {
  0: 'אפס',
  1: 'אחת',
  2: 'שתיים',
  3: 'שלוש',
  4: 'ארבע',
  5: 'חמש',
  6: 'שש',
  7: 'שבע',
  8: 'שמונה',
  9: 'תשע',
  10: 'עשר',
  11: 'אחת עשרה',
  12: 'שתים עשרה',
  13: 'שלוש עשרה',
  14: 'ארבע עשרה',
  15: 'חמש עשרה',
  16: 'שש עשרה',
  17: 'שבע עשרה',
  18: 'שמונה עשרה',
  19: 'תשע עשרה',
  20: 'עשרים',
}

export function heNum(n: number): string {
  return HE_NUMBERS[n] ?? String(n)
}

// ─── Counting Game ────────────────────────────────────────────────────────────

export interface CountingItem {
  emoji: string        // The object to count
  labelHe: string      // What the object is called in Hebrew
  labelEn: string
  count: number        // How many to show
  ttsHe: string        // Full TTS question string
  ttsEn: string
}

// K-POP themed counting objects
const COUNTING_OBJECTS = [
  { emoji: '🎤', labelHe: 'מיקרופונים', labelEn: 'microphones' },
  { emoji: '⭐', labelHe: 'כוכבים',     labelEn: 'stars'       },
  { emoji: '🎧', labelHe: 'אוזניות',    labelEn: 'headphones'  },
  { emoji: '🎵', labelHe: 'תווים',      labelEn: 'music notes' },
  { emoji: '💃', labelHe: 'רקדניות',    labelEn: 'dancers'     },
  { emoji: '🎸', labelHe: 'גיטרות',     labelEn: 'guitars'     },
  { emoji: '🌟', labelHe: 'כוכבי זהב',  labelEn: 'gold stars'  },
  { emoji: '🎹', labelHe: 'פסנתרים',    labelEn: 'pianos'      },
  { emoji: '💫', labelHe: 'ניצוצות',    labelEn: 'sparks'      },
  { emoji: '🎀', labelHe: 'פפיונים',    labelEn: 'bows'        },
  { emoji: '🎶', labelHe: 'מנגינות',    labelEn: 'melodies'    },
  { emoji: '👑', labelHe: 'כתרים',      labelEn: 'crowns'      },
]

function buildCountingItems(age: AgeProfile): CountingItem[] {
  const items: CountingItem[] = []

  for (const obj of COUNTING_OBJECTS) {
    // Age 3: 1–5 only (small, easy to count at a glance)
    // Age 5: 1–30 with variety
    const countPool = age === 3
      ? [1, 2, 3, 4, 5]
      : [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 25, 30]

    const count = countPool[Math.floor(Math.random() * countPool.length)]
    items.push({
      emoji: obj.emoji,
      labelHe: obj.labelHe,
      labelEn: obj.labelEn,
      count,
      ttsHe: `כמה ${obj.labelHe} יש?`,
      ttsEn: `How many ${obj.labelEn} are there?`,
    })
  }
  return items
}

// Pre-built pools — shuffled fresh each game via pickRandom
function getCountingItems(_lang: Language, age: AgeProfile): CountingItem[] {
  // Build a consistent set for both languages (count is the same, labels differ)
  return buildCountingItems(age)
}

export { getCountingItems }

// Distractor answers for counting game
export function getCountingChoices(correct: number, age: AgeProfile, count: number): number[] {
  const choices = new Set<number>([correct])

  if (age === 3) {
    // Age 3: only 2 choices, distractor is a close neighbor (±1 or ±2) within 1–5
    const offsets = [-2, -1, 1, 2].filter((o) => {
      const v = correct + o
      return v >= 1 && v <= 5
    })
    // Pick one random offset
    const offset = offsets[Math.floor(Math.random() * offsets.length)]
    choices.add(correct + offset)
  } else {
    const maxVal = 35
    while (choices.size < count) {
      const offset = Math.floor(Math.random() * 5) + 1
      const candidate = Math.random() < 0.5 ? correct + offset : correct - offset
      if (candidate > 0 && candidate <= maxVal && candidate !== correct) {
        choices.add(candidate)
      }
    }
  }
  return shuffle(Array.from(choices))
}

// ─── Comparison Game ──────────────────────────────────────────────────────────

export type CompareResult = 'more' | 'less' | 'equal'

export interface ComparisonItem {
  emojiA: string
  countA: number
  emojiB: string
  countB: number
  result: CompareResult
  // Age 5 follow-up: how many more/fewer?
  difference: number
  ttsHe: string
  ttsEn: string
}

const COMPARE_OBJECTS = [
  { emoji: '🎤' }, { emoji: '⭐' }, { emoji: '🎵' }, { emoji: '💫' },
  { emoji: '🎀' }, { emoji: '👑' }, { emoji: '🎸' }, { emoji: '🎶' },
  { emoji: '🌟' }, { emoji: '🎧' }, { emoji: '💃' }, { emoji: '🎹' },
]

function buildComparisonItems(age: AgeProfile): ComparisonItem[] {
  const maxCount = age === 3 ? 5 : 15
  const items: ComparisonItem[] = []
  const pairs = [...COMPARE_OBJECTS]
  shuffle(pairs)

  for (let i = 0; i + 1 < pairs.length; i += 2) {
    const a = Math.floor(Math.random() * maxCount) + 1
    let b = Math.floor(Math.random() * maxCount) + 1
    // Force equal case occasionally
    if (i % 6 === 0) b = a

    const result: CompareResult =
      a > b ? 'more' : a < b ? 'less' : 'equal'

    items.push({
      emojiA: pairs[i].emoji,
      countA: a,
      emojiB: pairs[i + 1].emoji,
      countB: b,
      result,
      difference: Math.abs(a - b),
      ttsHe: 'באיזה צד יש יותר? ימין או שמאל?',
      ttsEn: 'Which side has more? Left or right?',
    })
  }
  return items
}

export function getComparisonItems(age: AgeProfile): ComparisonItem[] {
  return buildComparisonItems(age)
}

// ─── Addition / Subtraction Game ──────────────────────────────────────────────

export type Operation = 'add' | 'sub'

export interface AddSubItem {
  a: number
  b: number
  op: Operation
  answer: number
  emojiA: string   // visual object for first number
  emojiB: string   // visual object for second number (same for add, removed for sub)
  ttsHe: string
  ttsEn: string
}

const ADDSUB_EMOJIS = ['🎤', '⭐', '🎵', '💫', '🎀', '👑', '🌟', '🎶']

function buildAddSubItems(age: AgeProfile): AddSubItem[] {
  const items: AddSubItem[] = []
  const ops: Operation[] = age === 3 ? ['add'] : ['add', 'sub']
  // Age 3: max sum of 5 (very simple); Age 5: up to 20
  const maxAnswer = age === 3 ? 5 : 20

  for (let i = 0; i < 16; i++) {
    const op = ops[i % ops.length]
    let a: number, b: number

    if (op === 'add') {
      if (age === 3) {
        // e.g. 1+1=2, 2+1=3, 2+2=4, 3+1=4, 3+2=5, 1+2=3, …
        a = Math.floor(Math.random() * (maxAnswer - 1)) + 1
        b = Math.floor(Math.random() * (maxAnswer - a)) + 1
        if (a + b > maxAnswer) b = maxAnswer - a
        if (b < 1) b = 1
        if (a + b > maxAnswer) a = maxAnswer - b
      } else {
        a = Math.floor(Math.random() * (maxAnswer - 1)) + 1
        b = Math.floor(Math.random() * (maxAnswer - a))
        if (a + b > maxAnswer) b = maxAnswer - a
      }
    } else {
      a = Math.floor(Math.random() * (maxAnswer - 1)) + 2
      b = Math.floor(Math.random() * (a - 1)) + 1
    }

    const answer = op === 'add' ? a + b : a - b
    const emojiA = ADDSUB_EMOJIS[i % ADDSUB_EMOJIS.length]
    const emojiB = ADDSUB_EMOJIS[(i + 3) % ADDSUB_EMOJIS.length]

    const ttsHe = op === 'add'
      ? `${heNum(a)} ועוד ${heNum(b)} שווה כמה?`
      : `${heNum(a)} פחות ${heNum(b)} שווה כמה?`
    const ttsEn = op === 'add'
      ? `${a} plus ${b} equals how much?`
      : `${a} minus ${b} equals how much?`

    items.push({ a, b, op, answer, emojiA, emojiB, ttsHe, ttsEn })
  }
  return items
}

export function getAddSubItems(age: AgeProfile): AddSubItem[] {
  return buildAddSubItems(age)
}

export function getAddSubChoices(correct: number, age: AgeProfile, count: number): number[] {
  const choices = new Set<number>([correct])
  const maxVal = age === 3 ? 5 : 22
  const minVal = age === 3 ? 1 : 0

  while (choices.size < count) {
    const offset = Math.floor(Math.random() * (age === 3 ? 2 : 4)) + 1
    const candidate = Math.random() < 0.5
      ? correct + offset
      : correct - offset
    if (candidate >= minVal && candidate <= maxVal && candidate !== correct) {
      choices.add(candidate)
    }
  }
  return shuffle(Array.from(choices))
}

// ─── Pattern Game ─────────────────────────────────────────────────────────────

export type PatternType = 'AB' | 'ABB' | 'ABC' | 'AABB'

export interface PatternItem {
  sequence: string[]   // Full repeating sequence (shown + blanks filled)
  shown: string[]      // What the child sees (blanks are '')
  answers: string[]    // What goes in the blanks (in order)
  blankIndices: number[]
  patternType: PatternType
  ttsHe: string
  ttsEn: string
}

const PATTERN_EMOJIS_A = ['🎤', '⭐', '🎵', '💫']
const PATTERN_EMOJIS_B = ['🎀', '👑', '🌟', '🎶']
const PATTERN_EMOJIS_C = ['🎸', '🎧', '💃', '🎹']

function buildPatternItem(patternType: PatternType, idx: number, age: AgeProfile): PatternItem {
  const a = PATTERN_EMOJIS_A[idx % PATTERN_EMOJIS_A.length]
  const b = PATTERN_EMOJIS_B[idx % PATTERN_EMOJIS_B.length]
  const c = PATTERN_EMOJIS_C[idx % PATTERN_EMOJIS_C.length]

  let unit: string[]
  switch (patternType) {
    case 'AB':   unit = [a, b]; break
    case 'ABB':  unit = [a, b, b]; break
    case 'ABC':  unit = [a, b, c]; break
    case 'AABB': unit = [a, a, b, b]; break
  }

  // Age 3: only 2 repetitions → 4 shown items + 1 blank (short & simple)
  // Age 5: 3 full repetitions → up to 2 blanks
  const reps = age === 3 ? 2 : 3
  const full = Array.from({ length: reps }, () => unit).flat()

  // Age 3: always exactly 1 blank (the very last item)
  // Age 5: 1 blank for AB, 2 blanks for longer patterns
  const blankCount = age === 3 ? 1 : (patternType === 'AB' ? 1 : 2)
  const blankIndices = full.map((_, i) => i).slice(full.length - blankCount)

  const shown = full.map((em, i) =>
    blankIndices.includes(i) ? '' : em
  )
  const answers = blankIndices.map((i) => full[i])

  return {
    sequence: full,
    shown,
    answers,
    blankIndices,
    patternType,
    ttsHe: 'מה הולך אחר כך בתבנית?',
    ttsEn: 'What comes next in the pattern?',
  }
}

export function getPatternItems(age: AgeProfile): PatternItem[] {
  // Age 3: only AB patterns (just 2 distinct items) — keep it simple
  const types: PatternType[] = age === 3
    ? Array.from({ length: 12 }, () => 'AB' as PatternType)
    : ['AB', 'ABC', 'AABB', 'ABB', 'ABC', 'AABB', 'ABC', 'ABB', 'AABB', 'ABC']

  return shuffle(types).map((type, i) => buildPatternItem(type, i, age))
}

export function getPatternChoices(
  answers: string[],
  count: number,
): string[] {
  // For single blank: return count options
  // For multi-blank: show choices for the FIRST blank only
  const correct = answers[0]
  const pool = [...PATTERN_EMOJIS_A, ...PATTERN_EMOJIS_B, ...PATTERN_EMOJIS_C]
  const distractors = shuffle(pool.filter((e) => e !== correct))
  const choices = [correct, ...distractors.slice(0, count - 1)]
  return shuffle(choices)
}

// ─── Number Recognition Game ──────────────────────────────────────────────────
// Show a large numeral. Child taps the group of objects with the matching count.

export interface NumRecognitionItem {
  target: number      // The number shown large on screen
  ttsHe: string       // Just the number — browser he-IL voice handles it
  ttsEn: string
  // 4 answer groups (or 2 for age 3), each with a count + emoji
  groups: { emoji: string; count: number }[]
  correctGroupIdx: number
}

const NUM_REC_EMOJIS = ['🎤', '⭐', '🎵', '💫', '🎀', '👑', '🌟', '🎶', '🎸', '🎧', '💃', '🎹']

function buildNumRecItems(age: AgeProfile): NumRecognitionItem[] {
  const maxNum = age === 3 ? 5 : 20
  const choiceCount = age === 3 ? 2 : 4
  const items: NumRecognitionItem[] = []

  const pool = age === 3
    ? [1, 2, 3, 4, 5]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  for (const target of shuffle(pool)) {
    // Build wrong counts — nearby but not equal, within range
    const wrongs = new Set<number>()
    while (wrongs.size < choiceCount - 1) {
      const offset = Math.floor(Math.random() * 4) + 1
      const v = Math.random() < 0.5 ? target + offset : target - offset
      if (v > 0 && v <= maxNum && v !== target) wrongs.add(v)
    }
    const counts = shuffle([target, ...Array.from(wrongs)])
    const correctGroupIdx = counts.indexOf(target)

    const emojiPool = shuffle([...NUM_REC_EMOJIS])
    const groups = counts.map((count, i) => ({
      emoji: emojiPool[i % emojiPool.length],
      count,
    }))

    items.push({
      target,
      ttsHe: String(target),    // he-IL voice reads the digit naturally
      ttsEn: String(target),
      groups,
      correctGroupIdx,
    })
  }
  return items
}

export function getNumRecItems(age: AgeProfile): NumRecognitionItem[] {
  return buildNumRecItems(age)
}
