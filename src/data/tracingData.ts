// ─── Tracing Data ─────────────────────────────────────────────────────────────
//
// Each TracingItem holds only metadata — no hand-drawn SVG paths.
// The visual guide and scoring mask are generated at runtime by rendering the
// actual Unicode character via canvas.fillText(), so every letter always
// looks exactly like the real letter (no approximations).
//
// Font used for rendering: 'Heebo', 'Assistant', Arial (Hebrew)
//                          'Nunito', 'Fredoka One', Arial (English/Numbers)

export interface TracingItem {
  id: string
  displayChar: string       // Unicode character — shown as guide + hint
  ttsName: string           // spoken via Web Speech API
  viewBox: string           // always '0 0 100 140'
  topLine: number           // y = 15
  midLine: number           // y = 70
  baseLine: number          // y = 113
  category: 'letter-en' | 'letter-he' | 'number'
}

const VB   = '0 0 100 140'
const TOP  = 15
const MID  = 70
const BASE = 113

// ── helpers ────────────────────────────────────────────────────────────────────

function he(id: string, char: string, name: string): TracingItem {
  return { id, displayChar: char, ttsName: name,
           viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE,
           category: 'letter-he' }
}
function en(id: string, char: string, name: string): TracingItem {
  return { id, displayChar: char, ttsName: name,
           viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE,
           category: 'letter-en' }
}
function num(id: string, char: string, nameHe: string): TracingItem {
  return { id, displayChar: char, ttsName: nameHe,
           viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE,
           category: 'number' }
}

// ─── Hebrew Letters ────────────────────────────────────────────────────────────
// Ordered simplest → most complex (for age-3 slicing).

export const TRACING_LETTERS_HE: TracingItem[] = [
  he('he-vav',         'ו', 'וָו'),
  he('he-yod',         'י', 'יוֹד'),
  he('he-resh',        'ר', 'רֵישׁ'),
  he('he-dalet',       'ד', 'דָּלֶת'),
  he('he-lamed',       'ל', 'לָמֶד'),
  he('he-het',         'ח', 'חֵית'),
  he('he-alef',        'א', 'אָלֶף'),
  he('he-bet',         'ב', 'בֵּית'),
  he('he-gimel',       'ג', 'גִּימֶל'),
  he('he-hey',         'ה', 'הֵא'),
  he('he-zayin',       'ז', 'זַיִן'),
  he('he-tet',         'ט', 'טֵית'),
  he('he-kaf',         'כ', 'כַּף'),
  he('he-mem',         'מ', 'מֵם'),
  he('he-nun',         'נ', 'נוּן'),
  he('he-samech',      'ס', 'סָמֶך'),
  he('he-ayin',        'ע', 'עַיִן'),
  he('he-pe',          'פ', 'פֵּא'),
  he('he-tsadi',       'צ', 'צָדִי'),
  he('he-kuf',         'ק', 'קוֹף'),
  he('he-shin',        'ש', 'שִׁין'),
  he('he-tav',         'ת', 'תָּו'),
  he('he-kaf-sofit',   'ך', 'כַּף סוֹפִית'),
  he('he-mem-sofit',   'ם', 'מֵם סוֹפִית'),
  he('he-nun-sofit',   'ן', 'נוּן סוֹפִית'),
  he('he-pe-sofit',    'ף', 'פֵּא סוֹפִית'),
  he('he-tsadi-sofit', 'ץ', 'צָדִי סוֹפִית'),
]

// ─── English Capital Letters A–Z ───────────────────────────────────────────────

export const TRACING_LETTERS_EN: TracingItem[] = [
  en('en-A', 'A', 'A'), en('en-B', 'B', 'B'), en('en-C', 'C', 'C'),
  en('en-D', 'D', 'D'), en('en-E', 'E', 'E'), en('en-F', 'F', 'F'),
  en('en-G', 'G', 'G'), en('en-H', 'H', 'H'), en('en-I', 'I', 'I'),
  en('en-J', 'J', 'J'), en('en-K', 'K', 'K'), en('en-L', 'L', 'L'),
  en('en-M', 'M', 'M'), en('en-N', 'N', 'N'), en('en-O', 'O', 'O'),
  en('en-P', 'P', 'P'), en('en-Q', 'Q', 'Q'), en('en-R', 'R', 'R'),
  en('en-S', 'S', 'S'), en('en-T', 'T', 'T'), en('en-U', 'U', 'U'),
  en('en-V', 'V', 'V'), en('en-W', 'W', 'W'), en('en-X', 'X', 'X'),
  en('en-Y', 'Y', 'Y'), en('en-Z', 'Z', 'Z'),
]

// ─── Digits 0–9 ────────────────────────────────────────────────────────────────

export const TRACING_NUMBERS: TracingItem[] = [
  num('num-0', '0', 'אֶפֶס'),
  num('num-1', '1', 'אֶחָד'),
  num('num-2', '2', 'שְׁתַּיִם'),
  num('num-3', '3', 'שָׁלוֹשׁ'),
  num('num-4', '4', 'אַרְבַּע'),
  num('num-5', '5', 'חָמֵשׁ'),
  num('num-6', '6', 'שֵׁשׁ'),
  num('num-7', '7', 'שֶׁבַע'),
  num('num-8', '8', 'שְׁמוֹנֶה'),
  num('num-9', '9', 'תֵּשַׁע'),
]

// ─── Helper ────────────────────────────────────────────────────────────────────

export function getTracingItems(
  category: 'letter-en' | 'letter-he' | 'number',
  age: 3 | 5,
): TracingItem[] {
  const pool =
    category === 'letter-en'  ? TRACING_LETTERS_EN
    : category === 'letter-he' ? TRACING_LETTERS_HE
    : TRACING_NUMBERS
  return age === 3 ? pool.slice(0, 4) : pool
}
