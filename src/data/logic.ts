// ─── Logic Room game content ────────────────────────────────────────────────

export interface OddOneOutRound {
  items: string[]   // 4 emojis
  correctIndex: number
  questionHe: string
  questionEn: string
}

// Age 3: very obvious groupings (3 of same category + 1 clearly different)
export const ODD_ONE_OUT_ROUNDS_AGE_3: OddOneOutRound[] = [
  { items: ['🐶','🐱','🚗','🦁'], correctIndex: 2, questionHe: 'מה לא חיה?', questionEn: "Which isn't an animal?" },
  { items: ['🍎','🍌','🚂','🍇'], correctIndex: 2, questionHe: 'מה לא אוכל?', questionEn: "Which isn't food?" },
  { items: ['🔴','🟡','🟢','🐸'], correctIndex: 3, questionHe: 'מה לא צבע?', questionEn: "Which isn't a colour?" },
  { items: ['🎸','🎹','🥁','🚌'], correctIndex: 3, questionHe: 'מה לא כלי נגינה?', questionEn: "Which isn't an instrument?" },
  { items: ['🚗','🚌','✈️','🌸'], correctIndex: 3, questionHe: 'מה לא רכב?', questionEn: "Which isn't a vehicle?" },
  { items: ['⭐','🌙','☀️','🍕'], correctIndex: 3, questionHe: 'מה לא בשמיים?', questionEn: "Which isn't in the sky?" },
  { items: ['👕','👖','🐠','🧢'], correctIndex: 2, questionHe: 'מה לא לובשים?', questionEn: "Which isn't clothing?" },
  { items: ['🔵','🟠','🟣','🍇'], correctIndex: 3, questionHe: 'מה לא צבע?', questionEn: "Which isn't a colour?" },
  { items: ['🐘','🦒','🐬','🦋'], correctIndex: 2, questionHe: 'מה לא חי ביבשה?', questionEn: "Which doesn't live on land?" },
  { items: ['🍦','🍰','🎂','🥦'], correctIndex: 3, questionHe: 'מה לא מתוק?', questionEn: "Which isn't sweet?" },
]

// Age 5: more subtle groupings
export const ODD_ONE_OUT_ROUNDS_AGE_5: OddOneOutRound[] = [
  { items: ['🐦','🦅','🦋','🐟'], correctIndex: 3, questionHe: 'מה לא יכול לעוף?', questionEn: "Which cannot fly?" },
  { items: ['🐳','🐬','🦈','🐊'], correctIndex: 3, questionHe: 'מה לא חי במים?', questionEn: "Which doesn't live in water?" },
  { items: ['🍓','🍒','🍎','🍋'], correctIndex: 3, questionHe: 'מה לא אדום?', questionEn: "Which isn't red?" },
  { items: ['🎻','🎸','🎺','🥁'], correctIndex: 3, questionHe: 'מה לא כלי מיתר?', questionEn: "Which isn't a string instrument?" },
  { items: ['🚀','✈️','🚁','🚗'], correctIndex: 3, questionHe: 'מה לא טס?', questionEn: "Which doesn't fly?" },
  { items: ['🌊','☔','❄️','🔥'], correctIndex: 3, questionHe: 'מה לא קשור למים?', questionEn: "Which isn't water?" },
  { items: ['🍊','🍋','🌕','🍇'], correctIndex: 3, questionHe: 'מה לא צהוב/כתום?', questionEn: "Which isn't orange or yellow?" },
  { items: ['🐅','🐆','🦁','🐬'], correctIndex: 3, questionHe: 'מה לא חתול גדול?', questionEn: "Which isn't a big cat?" },
  { items: ['🌹','🌷','🌸','🌿'], correctIndex: 3, questionHe: 'מה לא פרח?', questionEn: "Which isn't a flower?" },
  { items: ['🎤','🎧','🎼','🔨'], correctIndex: 3, questionHe: 'מה לא קשור למוזיקה?', questionEn: "Which isn't music-related?" },
]

// Emoji items for Shadow Match — the "silhouette" approach uses CSS filters
export interface ShadowMatchRound {
  target: string  // emoji to match
  choices: string[] // choices (target + distractors), target is at choices[correctIndex]
  correctIndex: number
  labelHe: string
  labelEn: string
}

export const SHADOW_MATCH_ROUNDS_AGE_3: ShadowMatchRound[] = [
  { target: '⭐', choices: ['⭐', '❤️'], correctIndex: 0, labelHe: 'כוכב', labelEn: 'Star' },
  { target: '🎤', choices: ['🎸', '🎤'], correctIndex: 1, labelHe: 'מיקרופון', labelEn: 'Mic' },
  { target: '🌙', choices: ['🌙', '☀️'], correctIndex: 0, labelHe: 'ירח', labelEn: 'Moon' },
  { target: '🎵', choices: ['🎵', '🔔'], correctIndex: 0, labelHe: 'תו מוזיקה', labelEn: 'Music note' },
  { target: '🌈', choices: ['⛅', '🌈'], correctIndex: 1, labelHe: 'קשת', labelEn: 'Rainbow' },
  { target: '🎀', choices: ['🎀', '🎁'], correctIndex: 0, labelHe: 'קשת', labelEn: 'Bow' },
  { target: '🦋', choices: ['🦋', '🌸'], correctIndex: 0, labelHe: 'פרפר', labelEn: 'Butterfly' },
  { target: '🏆', choices: ['🏆', '🎖️'], correctIndex: 0, labelHe: 'גביע', labelEn: 'Trophy' },
  { target: '💎', choices: ['💎', '💿'], correctIndex: 0, labelHe: 'יהלום', labelEn: 'Diamond' },
  { target: '🚀', choices: ['🛸', '🚀'], correctIndex: 1, labelHe: 'רקטה', labelEn: 'Rocket' },
]

export const SHADOW_MATCH_ROUNDS_AGE_5: ShadowMatchRound[] = [
  { target: '🎸', choices: ['🎻', '🎺', '🎸', '🥁'], correctIndex: 2, labelHe: 'גיטרה', labelEn: 'Guitar' },
  { target: '🦁', choices: ['🐯', '🦁', '🐻', '🐺'], correctIndex: 1, labelHe: 'אריה', labelEn: 'Lion' },
  { target: '🌹', choices: ['🌼', '🌺', '🌷', '🌹'], correctIndex: 3, labelHe: 'ורד', labelEn: 'Rose' },
  { target: '🎺', choices: ['🎸', '🎺', '🎹', '🎻'], correctIndex: 1, labelHe: 'חצוצרה', labelEn: 'Trumpet' },
  { target: '🐬', choices: ['🦈', '🐬', '🐳', '🐟'], correctIndex: 1, labelHe: 'דולפין', labelEn: 'Dolphin' },
  { target: '🌟', choices: ['⭐', '🌟', '💫', '✨'], correctIndex: 1, labelHe: 'כוכב זוהר', labelEn: 'Glowing star' },
  { target: '🎹', choices: ['🎹', '🎸', '🎵', '🎺'], correctIndex: 0, labelHe: 'פסנתר', labelEn: 'Piano' },
  { target: '🦊', choices: ['🐺', '🦊', '🐱', '🦁'], correctIndex: 1, labelHe: 'שועל', labelEn: 'Fox' },
  { target: '🌸', choices: ['🌺', '🌻', '🌸', '🌼'], correctIndex: 2, labelHe: 'פרח שרשיה', labelEn: 'Cherry blossom' },
  { target: '🎤', choices: ['📻', '🎵', '🎤', '🎧'], correctIndex: 2, labelHe: 'מיקרופון', labelEn: 'Mic' },
]

export const MEMORY_CARD_PAIRS_AGE_3 = ['🎤', '🎸', '⭐', '💖']
export const MEMORY_CARD_PAIRS_AGE_5 = ['🎤', '🎸', '⭐', '💖', '🎵', '🌟', '🏆', '🎀']

/** Fisher-Yates shuffle — returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick n random items from arr, no duplicates */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}