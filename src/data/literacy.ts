// ─── Literacy Room game content ────────────────────────────────────────────────
//
// All content for Letter Recognition, Word Completion, First Reading,
// and Finger Writing — for both Hebrew and English, ages 3 & 5.

import type { Language } from '../i18n/strings'

// ══════════════════════════════════════════════════════════════════════════════
// Letter Recognition
// ══════════════════════════════════════════════════════════════════════════════

export interface LetterItem {
  letter: string          // The target letter
  sound: string           // Phonetic description spoken via TTS
  emoji: string           // Visual representation
  word: string            // The word the emoji represents
}

export const LETTERS_EN: LetterItem[] = [
  { letter: 'A', sound: 'A as in Apple',   emoji: '🍎', word: 'Apple'    },
  { letter: 'B', sound: 'B as in Ball',    emoji: '⚽', word: 'Ball'     },
  { letter: 'C', sound: 'C as in Cat',     emoji: '🐱', word: 'Cat'      },
  { letter: 'D', sound: 'D as in Dog',     emoji: '🐶', word: 'Dog'      },
  { letter: 'E', sound: 'E as in Egg',     emoji: '🥚', word: 'Egg'      },
  { letter: 'F', sound: 'F as in Fish',    emoji: '🐟', word: 'Fish'     },
  { letter: 'G', sound: 'G as in Gift',    emoji: '🎁', word: 'Gift'     },
  { letter: 'H', sound: 'H as in Hat',     emoji: '🎩', word: 'Hat'      },
  { letter: 'I', sound: 'I as in Ice',     emoji: '🧊', word: 'Ice'      },
  { letter: 'J', sound: 'J as in Juice',   emoji: '🧃', word: 'Juice'    },
  { letter: 'K', sound: 'K as in Kite',    emoji: '🪁', word: 'Kite'     },
  { letter: 'L', sound: 'L as in Lion',    emoji: '🦁', word: 'Lion'     },
  { letter: 'M', sound: 'M as in Moon',    emoji: '🌙', word: 'Moon'     },
  { letter: 'N', sound: 'N as in Nest',    emoji: '🪺', word: 'Nest'     },
  { letter: 'O', sound: 'O as in Orange',  emoji: '🍊', word: 'Orange'   },
  { letter: 'P', sound: 'P as in Pizza',   emoji: '🍕', word: 'Pizza'    },
  { letter: 'Q', sound: 'Q as in Queen',   emoji: '👑', word: 'Queen'    },
  { letter: 'R', sound: 'R as in Rainbow', emoji: '🌈', word: 'Rainbow'  },
  { letter: 'S', sound: 'S as in Star',    emoji: '⭐', word: 'Star'     },
  { letter: 'T', sound: 'T as in Tree',    emoji: '🌳', word: 'Tree'     },
  { letter: 'U', sound: 'U as in Umbrella',emoji: '☂️', word: 'Umbrella' },
  { letter: 'V', sound: 'V as in Violin',  emoji: '🎻', word: 'Violin'   },
  { letter: 'W', sound: 'W as in Whale',   emoji: '🐋', word: 'Whale'    },
  { letter: 'X', sound: 'X as in Xylophone',emoji:'🎵',word: 'Xylophone' },
  { letter: 'Y', sound: 'Y as in Yarn',    emoji: '🧶', word: 'Yarn'     },
  { letter: 'Z', sound: 'Z as in Zebra',   emoji: '🦓', word: 'Zebra'    },
]

export const LETTERS_HE: LetterItem[] = [
  { letter: 'א', sound: 'אלף — כמו אמא',     emoji: '👩', word: 'אמא'   },
  { letter: 'ב', sound: 'בית — כמו בית',     emoji: '🏠', word: 'בית'   },
  { letter: 'ג', sound: 'גימל — כמו גמל',   emoji: '🐪', word: 'גמל'   },
  { letter: 'ד', sound: 'דלת — כמו דג',     emoji: '🐟', word: 'דג'    },
  { letter: 'ה', sound: 'הא — כמו הר',      emoji: '⛰️', word: 'הר'    },
  { letter: 'ו', sound: 'וו — כמו ורד',     emoji: '🌹', word: 'ורד'   },
  { letter: 'ז', sound: 'זין — כמו זנב',    emoji: '🦊', word: 'זנב'   },
  { letter: 'ח', sound: 'חית — כמו חתול',   emoji: '🐱', word: 'חתול'  },
  { letter: 'ט', sound: 'טית — כמו טוס',    emoji: '✈️', word: 'טוס'   },
  { letter: 'י', sound: 'יוד — כמו ילד',    emoji: '👦', word: 'ילד'   },
  { letter: 'כ', sound: 'כף — כמו כלב',     emoji: '🐶', word: 'כלב'   },
  { letter: 'ל', sound: 'למד — כמו לב',     emoji: '❤️', word: 'לב'    },
  { letter: 'מ', sound: 'מם — כמו מים',     emoji: '💧', word: 'מים'   },
  { letter: 'נ', sound: 'נון — כמו נר',     emoji: '🕯️', word: 'נר'    },
  { letter: 'ס', sound: 'סמך — כמו ספר',    emoji: '📚', word: 'ספר'   },
  { letter: 'ע', sound: 'עין — כמו עץ',     emoji: '🌳', word: 'עץ'    },
  { letter: 'פ', sound: 'פא — כמו פרח',     emoji: '🌸', word: 'פרח'   },
  { letter: 'צ', sound: 'צדי — כמו צב',     emoji: '🐢', word: 'צב'    },
  { letter: 'ק', sound: 'קוף — כמו קוף',    emoji: '🐒', word: 'קוף'   },
  { letter: 'ר', sound: 'ריש — כמו ריקוד',  emoji: '💃', word: 'ריקוד' },
  { letter: 'ש', sound: 'שין — כמו שמש',    emoji: '☀️', word: 'שמש'   },
  { letter: 'ת', sound: 'תו — כמו תפוח',    emoji: '🍎', word: 'תפוח'  },
]

export function getLetters(lang: Language): LetterItem[] {
  return lang === 'he' ? LETTERS_HE : LETTERS_EN
}

// ══════════════════════════════════════════════════════════════════════════════
// Word Completion
// ══════════════════════════════════════════════════════════════════════════════

export interface WordItem {
  word: string           // full word
  emoji: string          // picture
  ttsWord: string        // how TTS should pronounce it
  /** Index of the missing letter (0-based) */
  missingIndex: number
}

export const WORDS_EN: WordItem[] = [
  { word: 'CAT',  emoji: '🐱', ttsWord: 'cat',     missingIndex: 0 },  // _AT
  { word: 'DOG',  emoji: '🐶', ttsWord: 'dog',     missingIndex: 1 },  // D_G
  { word: 'SUN',  emoji: '☀️', ttsWord: 'sun',     missingIndex: 2 },  // SU_
  { word: 'HAT',  emoji: '🎩', ttsWord: 'hat',     missingIndex: 0 },  // _AT
  { word: 'CUP',  emoji: '☕', ttsWord: 'cup',     missingIndex: 1 },  // C_P
  { word: 'BED',  emoji: '🛏️', ttsWord: 'bed',     missingIndex: 0 },  // _ED
  { word: 'PEN',  emoji: '✏️', ttsWord: 'pen',     missingIndex: 2 },  // PE_
  { word: 'FAN',  emoji: '🌬️', ttsWord: 'fan',     missingIndex: 1 },  // F_N
  { word: 'BUS',  emoji: '🚌', ttsWord: 'bus',     missingIndex: 0 },  // _US
  { word: 'ANT',  emoji: '🐜', ttsWord: 'ant',     missingIndex: 2 },  // AN_
  { word: 'FOX',  emoji: '🦊', ttsWord: 'fox',     missingIndex: 1 },  // F_X
  { word: 'MOP',  emoji: '🧹', ttsWord: 'mop',     missingIndex: 0 },  // _OP
]

export const WORDS_HE: WordItem[] = [
  { word: 'אמא',  emoji: '👩', ttsWord: 'אמא',    missingIndex: 0 },  // _מא
  { word: 'בית',  emoji: '🏠', ttsWord: 'בית',    missingIndex: 1 },  // ב_ת
  { word: 'כלב',  emoji: '🐶', ttsWord: 'כלב',    missingIndex: 2 },  // כל_
  { word: 'ילד',  emoji: '👦', ttsWord: 'ילד',    missingIndex: 0 },  // _לד
  { word: 'שמש',  emoji: '☀️', ttsWord: 'שמש',    missingIndex: 1 },  // ש_ש
  { word: 'ספר',  emoji: '📚', ttsWord: 'ספר',    missingIndex: 2 },  // ספ_
  { word: 'דג',   emoji: '🐟', ttsWord: 'דג',     missingIndex: 1 },  // ד_
  { word: 'פרח',  emoji: '🌸', ttsWord: 'פרח',    missingIndex: 0 },  // _רח
  { word: 'עץ',   emoji: '🌳', ttsWord: 'עץ',     missingIndex: 1 },  // ע_
  { word: 'חתול', emoji: '🐱', ttsWord: 'חתול',   missingIndex: 1 },  // ח_תול
  { word: 'ירח',  emoji: '🌙', ttsWord: 'ירח',    missingIndex: 2 },  // יר_
  { word: 'ורד',  emoji: '🌹', ttsWord: 'ורד',    missingIndex: 0 },  // _רד
]

export function getWords(lang: Language): WordItem[] {
  return lang === 'he' ? WORDS_HE : WORDS_EN
}

/** Build the display of the word with the missing letter shown as _ */
export function buildWordDisplay(item: WordItem): string {
  return item.word
    .split('')
    .map((ch, i) => (i === item.missingIndex ? '_' : ch))
    .join('')
}

/** Get the missing letter */
export function getMissingLetter(item: WordItem): string {
  return item.word[item.missingIndex]
}

/** Generate wrong-letter distractors (not the correct letter) */
export function getLetterChoices(
  correct: string,
  allLetters: LetterItem[],
  count: number
): string[] {
  const pool = allLetters
    .map((l) => l.letter)
    .filter((l) => l !== correct)
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count - 1)
  const choices = [...shuffled, correct].sort(() => Math.random() - 0.5)
  return choices
}

// ══════════════════════════════════════════════════════════════════════════════
// First Reading
// ══════════════════════════════════════════════════════════════════════════════

export interface ReadingWordItem {
  word: string
  emoji: string
  ttsWord: string
}

export interface ReadingSentenceItem {
  sentence: string
  words: string[]
  emoji: string
  ttsSentence: string
}

export const READING_WORDS_EN: ReadingWordItem[] = [
  { word: 'Cat',  emoji: '🐱', ttsWord: 'cat'  },
  { word: 'Dog',  emoji: '🐶', ttsWord: 'dog'  },
  { word: 'Sun',  emoji: '☀️', ttsWord: 'sun'  },
  { word: 'Hat',  emoji: '🎩', ttsWord: 'hat'  },
  { word: 'Cup',  emoji: '☕', ttsWord: 'cup'  },
  { word: 'Bed',  emoji: '🛏️', ttsWord: 'bed'  },
  { word: 'Pen',  emoji: '✏️', ttsWord: 'pen'  },
  { word: 'Fan',  emoji: '🌬️', ttsWord: 'fan'  },
]

export const READING_WORDS_HE: ReadingWordItem[] = [
  { word: 'אמא',  emoji: '👩', ttsWord: 'אמא'  },
  { word: 'בית',  emoji: '🏠', ttsWord: 'בית'  },
  { word: 'כלב',  emoji: '🐶', ttsWord: 'כלב'  },
  { word: 'שמש',  emoji: '☀️', ttsWord: 'שמש'  },
  { word: 'ספר',  emoji: '📚', ttsWord: 'ספר'  },
  { word: 'פרח',  emoji: '🌸', ttsWord: 'פרח'  },
  { word: 'דג',   emoji: '🐟', ttsWord: 'דג'   },
  { word: 'ירח',  emoji: '🌙', ttsWord: 'ירח'  },
]

export const READING_SENTENCES_EN: ReadingSentenceItem[] = [
  { sentence: 'The cat is big.',         words: ['The','cat','is','big.'],         emoji: '🐱', ttsSentence: 'The cat is big.' },
  { sentence: 'I see a dog.',            words: ['I','see','a','dog.'],            emoji: '🐶', ttsSentence: 'I see a dog.' },
  { sentence: 'The sun is hot.',         words: ['The','sun','is','hot.'],         emoji: '☀️', ttsSentence: 'The sun is hot.' },
  { sentence: 'My hat is red.',          words: ['My','hat','is','red.'],          emoji: '🎩', ttsSentence: 'My hat is red.' },
  { sentence: 'I like to sing.',         words: ['I','like','to','sing.'],         emoji: '🎤', ttsSentence: 'I like to sing.' },
  { sentence: 'Stars shine at night.',   words: ['Stars','shine','at','night.'],   emoji: '⭐', ttsSentence: 'Stars shine at night.' },
]

export const READING_SENTENCES_HE: ReadingSentenceItem[] = [
  { sentence: 'החתול גדול.',             words: ['ה','חתול','גדול.'],              emoji: '🐱', ttsSentence: 'החתול גדול' },
  { sentence: 'אני רואה כלב.',           words: ['אני','רואה','כלב.'],            emoji: '🐶', ttsSentence: 'אני רואה כלב' },
  { sentence: 'השמש חמה.',               words: ['ה','שמש','חמה.'],               emoji: '☀️', ttsSentence: 'השמש חמה' },
  { sentence: 'אני אוהבת לשיר.',         words: ['אני','אוהבת','לשיר.'],          emoji: '🎤', ttsSentence: 'אני אוהבת לשיר' },
  { sentence: 'הכוכבים זורחים בלילה.',   words: ['ה','כוכבים','זורחים','בלילה.'], emoji: '⭐', ttsSentence: 'הכוכבים זורחים בלילה' },
  { sentence: 'הבית שלי יפה.',           words: ['ה','בית','שלי','יפה.'],         emoji: '🏠', ttsSentence: 'הבית שלי יפה' },
]

export function getReadingWords(lang: Language): ReadingWordItem[] {
  return lang === 'he' ? READING_WORDS_HE : READING_WORDS_EN
}

export function getReadingSentences(lang: Language): ReadingSentenceItem[] {
  return lang === 'he' ? READING_SENTENCES_HE : READING_SENTENCES_EN
}

// ══════════════════════════════════════════════════════════════════════════════
// Finger Writing — letter stroke paths for tracing
// ══════════════════════════════════════════════════════════════════════════════

export interface WritingLetter {
  letter: string
  displayLetter: string // same, but kept for clarity
  svgPath: string       // the dotted guide path (SVG path d attribute)
  viewBox: string
  ttsName: string
}

// We define simplified SVG paths for each letter on a 100×100 viewBox.
// These are used both as the guide dots AND as the filled-in shape on completion.
export const WRITING_LETTERS_EN: WritingLetter[] = [
  {
    letter: 'A', displayLetter: 'A',
    viewBox: '0 0 100 120',
    svgPath: 'M 50 10 L 15 100 M 50 10 L 85 100 M 25 65 L 75 65',
    ttsName: 'A',
  },
  {
    letter: 'B', displayLetter: 'B',
    viewBox: '0 0 100 120',
    svgPath: 'M 20 10 L 20 110 M 20 10 Q 70 10 70 40 Q 70 60 20 60 M 20 60 Q 75 60 75 85 Q 75 110 20 110',
    ttsName: 'B',
  },
  {
    letter: 'C', displayLetter: 'C',
    viewBox: '0 0 100 120',
    svgPath: 'M 80 25 Q 20 10 20 60 Q 20 110 80 95',
    ttsName: 'C',
  },
  {
    letter: 'D', displayLetter: 'D',
    viewBox: '0 0 100 120',
    svgPath: 'M 20 10 L 20 110 M 20 10 Q 90 10 90 60 Q 90 110 20 110',
    ttsName: 'D',
  },
  {
    letter: 'E', displayLetter: 'E',
    viewBox: '0 0 100 120',
    svgPath: 'M 75 10 L 20 10 L 20 110 L 75 110 M 20 60 L 65 60',
    ttsName: 'E',
  },
  {
    letter: 'S', displayLetter: 'S',
    viewBox: '0 0 100 120',
    svgPath: 'M 75 25 Q 25 5 25 45 Q 25 65 75 75 Q 75 115 25 95',
    ttsName: 'S',
  },
  {
    letter: 'O', displayLetter: 'O',
    viewBox: '0 0 100 120',
    svgPath: 'M 50 10 Q 90 10 90 60 Q 90 110 50 110 Q 10 110 10 60 Q 10 10 50 10',
    ttsName: 'O',
  },
  {
    letter: 'M', displayLetter: 'M',
    viewBox: '0 0 100 120',
    svgPath: 'M 10 110 L 10 10 L 50 60 L 90 10 L 90 110',
    ttsName: 'M',
  },
]

export const WRITING_LETTERS_HE: WritingLetter[] = [
  {
    letter: 'א', displayLetter: 'א',
    viewBox: '0 0 100 120',
    svgPath: 'M 50 10 L 50 110 M 15 25 L 50 60 M 50 60 L 85 95',
    ttsName: 'אלף',
  },
  {
    letter: 'ב', displayLetter: 'ב',
    viewBox: '0 0 100 120',
    svgPath: 'M 80 10 L 20 10 L 20 90 Q 20 110 50 110 Q 80 110 80 90',
    ttsName: 'בית',
  },
  {
    letter: 'ג', displayLetter: 'ג',
    viewBox: '0 0 100 120',
    svgPath: 'M 80 10 L 20 10 M 20 10 L 20 80 Q 20 110 50 110',
    ttsName: 'גימל',
  },
  {
    letter: 'ד', displayLetter: 'ד',
    viewBox: '0 0 100 120',
    svgPath: 'M 20 10 L 80 10 M 80 10 L 80 110',
    ttsName: 'דלת',
  },
  {
    letter: 'ו', displayLetter: 'ו',
    viewBox: '0 0 100 120',
    svgPath: 'M 50 10 L 50 90 Q 50 110 35 110',
    ttsName: 'וו',
  },
  {
    letter: 'מ', displayLetter: 'מ',
    viewBox: '0 0 100 120',
    svgPath: 'M 80 10 L 20 10 L 20 70 Q 20 90 50 90 Q 80 90 80 70 L 80 90 L 65 110',
    ttsName: 'מם',
  },
  {
    letter: 'ש', displayLetter: 'ש',
    viewBox: '0 0 100 120',
    svgPath: 'M 10 10 L 10 80 Q 10 110 50 110 Q 90 110 90 80 L 90 10 M 50 60 L 50 110',
    ttsName: 'שין',
  },
  {
    letter: 'ת', displayLetter: 'ת',
    viewBox: '0 0 100 120',
    svgPath: 'M 10 10 L 10 110 Q 10 70 50 70 M 50 10 L 90 10 L 90 70 Q 90 70 50 70',
    ttsName: 'תו',
  },
]

export function getWritingLetters(lang: Language, age: 3 | 5): WritingLetter[] {
  const pool = lang === 'he' ? WRITING_LETTERS_HE : WRITING_LETTERS_EN
  // Age 3: first 4 (simpler letters), Age 5: all 8
  return age === 3 ? pool.slice(0, 4) : pool
}

// ══════════════════════════════════════════════════════════════════════════════
// Shared helpers
// ══════════════════════════════════════════════════════════════════════════════

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

export const SPARKS_PER_ROUND = 10
export const SPARKS_COMPLETION_BONUS = 50
export const ROUNDS_PER_GAME = 10
