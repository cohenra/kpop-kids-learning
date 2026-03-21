// ─── Song Studio — questions, choices, lyric generation ───────────────────────
//
// The child answers 5 questions (one at a time). Their choices are plugged into
// a lyric template to produce a 6-line K-POP song, which is then read aloud
// with TTS while a beat plays in the background.
//
// Architecture:
//   5 SongQuestions × 3 SongChoices  →  buildLyrics()  →  string[]
//                                                           ↓
//                                              TTS + Web Audio beat player

export interface SongChoice {
  id: string
  textHe: string
  textEn: string
  emoji: string
}

export interface SongQuestion {
  id: 'theme' | 'opening' | 'rhythm' | 'feeling' | 'ending'
  questionHe: string
  questionEn: string
  ttsHe: string     // shorter, read aloud
  ttsEn: string
  choices: SongChoice[]
}

export interface BuiltSong {
  theme: string
  opening: string
  rhythm: string
  feeling: string
  ending: string
  lyricsHe: string[]
  lyricsEn: string[]
  createdAt: number
}

// ─── Questions ────────────────────────────────────────────────────────────────

export const SONG_QUESTIONS: SongQuestion[] = [
  {
    id: 'theme',
    questionHe: 'מה השיר שלך יהיה עליו?',
    questionEn: 'What will your song be about?',
    ttsHe: 'מה השיר שלך יהיה עליו?',
    ttsEn: 'What will your song be about?',
    choices: [
      { id: 'stars',   textHe: 'ניצוצות כוכבים', textEn: 'Star Sparks',      emoji: '⭐' },
      { id: 'friends', textHe: 'חברות הכי טובות', textEn: 'Best Friends',      emoji: '💕' },
      { id: 'dance',   textHe: 'ריקוד בבמה',      textEn: 'Dancing on Stage',  emoji: '💃' },
    ],
  },
  {
    id: 'opening',
    questionHe: 'איך השיר מתחיל?',
    questionEn: 'How does the song begin?',
    ttsHe: 'איך השיר שלך מתחיל?',
    ttsEn: 'How does your song begin?',
    choices: [
      { id: 'hey',  textHe: 'היי! היי!',     textEn: 'Hey! Hey!',    emoji: '👋' },
      { id: 'ooh',  textHe: 'אוהה! אוהה!',   textEn: 'Ooh! Ooh!',   emoji: '🎤' },
      { id: 'boom', textHe: 'בום! בום! בום!', textEn: 'Boom! Boom!', emoji: '🥁' },
    ],
  },
  {
    id: 'rhythm',
    questionHe: 'איזה קצב?',
    questionEn: 'What rhythm?',
    ttsHe: 'איזה קצב אתה רוצה?',
    ttsEn: 'What rhythm do you want?',
    choices: [
      { id: 'fast',   textHe: 'מהיר ועליז',      textEn: 'Fast & Fun',      emoji: '⚡' },
      { id: 'slow',   textHe: 'איטי ומרגש',       textEn: 'Slow & Emotional', emoji: '🌙' },
      { id: 'bouncy', textHe: 'קפצני ומשוגע',     textEn: 'Bouncy & Crazy',   emoji: '🐰' },
    ],
  },
  {
    id: 'feeling',
    questionHe: 'מה ההרגשה בשיר?',
    questionEn: 'What feeling is in the song?',
    ttsHe: 'מה ההרגשה בשיר?',
    ttsEn: 'What feeling is in the song?',
    choices: [
      { id: 'happy',  textHe: 'שמחה ואהבה',   textEn: 'Happy & Loving',  emoji: '❤️' },
      { id: 'strong', textHe: 'חזקה וגיבורה',  textEn: 'Strong & Brave',  emoji: '💪' },
      { id: 'dreamy', textHe: 'חלומית וקסומה', textEn: 'Dreamy & Magic',  emoji: '✨' },
    ],
  },
  {
    id: 'ending',
    questionHe: 'איך השיר נגמר?',
    questionEn: 'How does the song end?',
    ttsHe: 'איך השיר שלך נגמר?',
    ttsEn: 'How does your song end?',
    choices: [
      { id: 'together', textHe: 'כולם ביחד!',        textEn: 'All Together!',      emoji: '🎉' },
      { id: 'star',     textHe: 'על הבמה, כוכבת!',   textEn: 'On Stage, Star!',    emoji: '🌟' },
      { id: 'forever',  textHe: 'שוב ושוב לעולם!',   textEn: 'Again & Forever!',   emoji: '🔄' },
    ],
  },
]

// ─── Lyric lookup maps ────────────────────────────────────────────────────────

const THEME_MAP: Record<string, { he: string; en: string }> = {
  stars:   { he: 'ניצוצות הכוכבים',   en: 'star sparks' },
  friends: { he: 'חברות הכי טובות',   en: 'best friends' },
  dance:   { he: 'ריקוד ברחבת הבמה', en: 'dancing on stage' },
}

const OPENING_MAP: Record<string, { he: string; en: string }> = {
  hey:  { he: 'היי! היי!',     en: 'Hey! Hey!' },
  ooh:  { he: 'אוהה! אוהה!',   en: 'Ooh! Ooh!' },
  boom: { he: 'בום! בום! בום!', en: 'Boom! Boom! Boom!' },
}

const RHYTHM_MAP: Record<string, { he: string; en: string }> = {
  fast:   { he: 'מהיר ועליז, הלב קופץ', en: "Fast and fun, heart's jumping" },
  slow:   { he: 'לאט לאט, עם הרגש',     en: 'Slow and sweet, with feeling' },
  bouncy: { he: 'קפצני ומשוגע, קדימה',  en: 'Bouncy and crazy, let\'s go' },
}

const FEELING_MAP: Record<string, { he: string; en: string }> = {
  happy:  { he: 'שמחה ואהבה בלב',    en: 'happy and loving at heart' },
  strong: { he: 'חזקה וגיבורה ממש',  en: 'strong and brave for real' },
  dreamy: { he: 'חלומית וקסומה כוכב', en: 'dreamy and magic like a star' },
}

const ENDING_MAP: Record<string, { he: string; en: string }> = {
  together: { he: 'כולם ביחד!',        en: 'All Together!' },
  star:     { he: 'על הבמה — כוכבת!', en: 'On Stage — Superstar!' },
  forever:  { he: 'שוב ושוב לעולם!',   en: 'Again and Forever!' },
}

// ─── Lyric builder ────────────────────────────────────────────────────────────

export function buildLyrics(
  choices: Pick<BuiltSong, 'theme' | 'opening' | 'rhythm' | 'feeling' | 'ending'>,
  lang: 'he' | 'en'
): string[] {
  const theme   = THEME_MAP[choices.theme]?.[lang]   ?? choices.theme
  const opening = OPENING_MAP[choices.opening]?.[lang] ?? choices.opening
  const rhythm  = RHYTHM_MAP[choices.rhythm]?.[lang]  ?? choices.rhythm
  const feeling = FEELING_MAP[choices.feeling]?.[lang] ?? choices.feeling
  const ending  = ENDING_MAP[choices.ending]?.[lang]  ?? choices.ending

  if (lang === 'he') {
    return [
      `${opening}`,
      `אנחנו שרות על ${theme}`,
      `${rhythm}`,
      `${feeling} — עם הלהקה הכי טובה!`,
      `${opening}`,
      `${ending}`,
    ]
  }
  return [
    `${opening}`,
    `We're singing about ${theme}`,
    `${rhythm}`,
    `${feeling} — with the best band ever!`,
    `${opening}`,
    `${ending}`,
  ]
}

// ─── Tempo per rhythm choice ──────────────────────────────────────────────────
export const RHYTHM_BPM: Record<string, number> = {
  fast:   140,
  slow:   72,
  bouncy: 118,
}
