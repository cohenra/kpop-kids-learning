// ─── Tracing Data ─────────────────────────────────────────────────────────────
//
// SVG paths, start points, and writing-guide lines for letter/number tracing.
//
// Coordinate system: viewBox '0 0 100 140'
//   topLine  = y 15  (tall letters touch this — also lamed ascender)
//   midLine  = y 70  (x-height reference)
//   baseLine = y 115 (all letters sit here; descenders go below to ~132)
//
// Stroke order follows standard school teaching conventions:
//   English — Zaner-Bloser manuscript print
//   Hebrew  — Israeli block print (דפוס בלוק)
//
// Multi-stroke letters present strokes one at a time in correct order,
// so children learn the right sequence from the start.

export interface TracingStroke {
  path: string                         // SVG path d= attribute
  startPoint: { x: number; y: number } // pulsing green dot position
}

export interface TracingItem {
  id: string
  displayChar: string        // large hint glyph shown beside the canvas
  ttsName: string            // spoken via Web Speech API
  strokes: TracingStroke[]   // ordered; child traces one at a time
  viewBox: string            // always '0 0 100 140'
  topLine: number            // y = 15
  midLine: number            // y = 70
  baseLine: number           // y = 115
  category: 'letter-en' | 'letter-he' | 'number'
}

const VB   = '0 0 100 140'
const TOP  = 15
const MID  = 70
const BASE = 115

// ─── English Capital Letters A–Z ──────────────────────────────────────────────

export const TRACING_LETTERS_EN: TracingItem[] = [
  {
    id: 'en-A', displayChar: 'A', ttsName: 'A',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 50 15 L 15 115',  startPoint: { x: 50, y: 15 } },
      { path: 'M 50 15 L 85 115',  startPoint: { x: 50, y: 15 } },
      { path: 'M 28 76 L 72 76',   startPoint: { x: 28, y: 76 } },
    ],
  },
  {
    id: 'en-B', displayChar: 'B', ttsName: 'B',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115', startPoint: { x: 20, y: 15 } },
      {
        path: 'M 20 15 Q 72 15 72 45 Q 72 65 20 65 Q 72 65 72 90 Q 72 115 20 115',
        startPoint: { x: 20, y: 15 },
      },
    ],
  },
  {
    id: 'en-C', displayChar: 'C', ttsName: 'C',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 82 33 Q 82 15 50 15 Q 14 15 14 65 Q 14 115 50 115 Q 82 115 82 97',
        startPoint: { x: 82, y: 33 },
      },
    ],
  },
  {
    id: 'en-D', displayChar: 'D', ttsName: 'D',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115', startPoint: { x: 20, y: 15 } },
      { path: 'M 20 15 Q 92 15 92 65 Q 92 115 20 115', startPoint: { x: 20, y: 15 } },
    ],
  },
  {
    id: 'en-E', displayChar: 'E', ttsName: 'E',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115',  startPoint: { x: 20, y: 15 } },
      { path: 'M 20 15 L 80 15',   startPoint: { x: 20, y: 15 } },
      { path: 'M 20 65 L 65 65',   startPoint: { x: 20, y: 65 } },
      { path: 'M 20 115 L 80 115', startPoint: { x: 20, y: 115 } },
    ],
  },
  {
    id: 'en-F', displayChar: 'F', ttsName: 'F',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115', startPoint: { x: 20, y: 15 } },
      { path: 'M 20 15 L 80 15',  startPoint: { x: 20, y: 15 } },
      { path: 'M 20 65 L 65 65',  startPoint: { x: 20, y: 65 } },
    ],
  },
  {
    id: 'en-G', displayChar: 'G', ttsName: 'G',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 82 33 Q 82 15 50 15 Q 14 15 14 65 Q 14 115 50 115 Q 82 115 82 85 L 82 65 L 52 65',
        startPoint: { x: 82, y: 33 },
      },
    ],
  },
  {
    id: 'en-H', displayChar: 'H', ttsName: 'H',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 18 15 L 18 115', startPoint: { x: 18, y: 15 } },
      { path: 'M 82 15 L 82 115', startPoint: { x: 82, y: 15 } },
      { path: 'M 18 65 L 82 65',  startPoint: { x: 18, y: 65 } },
    ],
  },
  {
    id: 'en-I', displayChar: 'I', ttsName: 'I',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 30 15 L 70 15',   startPoint: { x: 30, y: 15 } },
      { path: 'M 50 15 L 50 115',  startPoint: { x: 50, y: 15 } },
      { path: 'M 30 115 L 70 115', startPoint: { x: 30, y: 115 } },
    ],
  },
  {
    id: 'en-J', displayChar: 'J', ttsName: 'J',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 28 15 L 68 15', startPoint: { x: 28, y: 15 } },
      {
        path: 'M 68 15 L 68 90 Q 68 115 45 115 Q 22 115 20 95',
        startPoint: { x: 68, y: 15 },
      },
    ],
  },
  {
    id: 'en-K', displayChar: 'K', ttsName: 'K',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 18 15 L 18 115', startPoint: { x: 18, y: 15 } },
      { path: 'M 18 65 L 82 15',  startPoint: { x: 18, y: 65 } },
      { path: 'M 18 65 L 82 115', startPoint: { x: 18, y: 65 } },
    ],
  },
  {
    id: 'en-L', displayChar: 'L', ttsName: 'L',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115 L 82 115', startPoint: { x: 20, y: 15 } },
    ],
  },
  {
    id: 'en-M', displayChar: 'M', ttsName: 'M',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 10 115 L 10 15 L 50 65 L 90 15 L 90 115', startPoint: { x: 10, y: 115 } },
    ],
  },
  {
    id: 'en-N', displayChar: 'N', ttsName: 'N',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 18 115 L 18 15 L 82 115 L 82 15', startPoint: { x: 18, y: 115 } },
    ],
  },
  {
    id: 'en-O', displayChar: 'O', ttsName: 'O',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 50 15 Q 90 15 90 65 Q 90 115 50 115 Q 10 115 10 65 Q 10 15 50 15',
        startPoint: { x: 50, y: 15 },
      },
    ],
  },
  {
    id: 'en-P', displayChar: 'P', ttsName: 'P',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115', startPoint: { x: 20, y: 15 } },
      {
        path: 'M 20 15 Q 80 15 80 45 Q 80 65 20 65',
        startPoint: { x: 20, y: 15 },
      },
    ],
  },
  {
    id: 'en-Q', displayChar: 'Q', ttsName: 'Q',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 50 15 Q 90 15 90 65 Q 90 115 50 115 Q 10 115 10 65 Q 10 15 50 15',
        startPoint: { x: 50, y: 15 },
      },
      { path: 'M 65 90 L 88 115', startPoint: { x: 65, y: 90 } },
    ],
  },
  {
    id: 'en-R', displayChar: 'R', ttsName: 'R',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 20 15 L 20 115', startPoint: { x: 20, y: 15 } },
      {
        path: 'M 20 15 Q 80 15 80 45 Q 80 65 20 65 L 82 115',
        startPoint: { x: 20, y: 15 },
      },
    ],
  },
  {
    id: 'en-S', displayChar: 'S', ttsName: 'S',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 80 30 Q 80 15 50 15 Q 20 15 20 46 Q 20 65 50 70 Q 80 75 80 95 Q 80 115 50 115 Q 20 115 20 100',
        startPoint: { x: 80, y: 30 },
      },
    ],
  },
  {
    id: 'en-T', displayChar: 'T', ttsName: 'T',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 15 15 L 85 15',  startPoint: { x: 15, y: 15 } },
      { path: 'M 50 15 L 50 115', startPoint: { x: 50, y: 15 } },
    ],
  },
  {
    id: 'en-U', displayChar: 'U', ttsName: 'U',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 18 15 L 18 88 Q 18 115 50 115 Q 82 115 82 88 L 82 15',
        startPoint: { x: 18, y: 15 },
      },
    ],
  },
  {
    id: 'en-V', displayChar: 'V', ttsName: 'V',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 15 15 L 50 115 L 85 15', startPoint: { x: 15, y: 15 } },
    ],
  },
  {
    id: 'en-W', displayChar: 'W', ttsName: 'W',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 10 15 L 28 115 L 50 68 L 72 115 L 90 15',
        startPoint: { x: 10, y: 15 },
      },
    ],
  },
  {
    id: 'en-X', displayChar: 'X', ttsName: 'X',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 15 15 L 85 115', startPoint: { x: 15, y: 15 } },
      { path: 'M 85 15 L 15 115', startPoint: { x: 85, y: 15 } },
    ],
  },
  {
    id: 'en-Y', displayChar: 'Y', ttsName: 'Y',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      { path: 'M 15 15 L 50 65 L 85 15', startPoint: { x: 15, y: 15 } },
      { path: 'M 50 65 L 50 115',         startPoint: { x: 50, y: 65 } },
    ],
  },
  {
    id: 'en-Z', displayChar: 'Z', ttsName: 'Z',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-en',
    strokes: [
      {
        path: 'M 15 15 L 85 15 L 15 115 L 85 115',
        startPoint: { x: 15, y: 15 },
      },
    ],
  },
]

// ─── Hebrew Block Letters — כל האלפבית ────────────────────────────────────────
// א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת
// Plus 5 sofit forms: ך ם ן ף ץ
//
// Stroke direction: Hebrew is RTL, strokes generally start from the right.
// Paths reflect standard Israeli school block-print (דפוס) conventions.
// Letters with descenders (ק ף ץ ך ן) drop below baseLine toward y=132.

export const TRACING_LETTERS_HE: TracingItem[] = [
  // ── א ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-alef', displayChar: 'א', ttsName: 'אָלֶף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 72 25 L 28 100',  startPoint: { x: 72, y: 25 } }, // main diagonal
      { path: 'M 22 30 L 52 58',   startPoint: { x: 22, y: 30 } }, // upper-left arm
      { path: 'M 48 68 L 78 97',   startPoint: { x: 48, y: 68 } }, // lower-right arm
    ],
  },
  // ── ב ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-bet', displayChar: 'ב', ttsName: 'בֵּית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 82 22 L 20 22 L 20 92 Q 20 115 52 115 Q 82 115 82 92',
        startPoint: { x: 82, y: 22 },
      },
    ],
  },
  // ── ג ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-gimel', displayChar: 'ג', ttsName: 'גִּימֶל',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 78 22 L 22 22 L 22 85 Q 22 115 48 115',
        startPoint: { x: 78, y: 22 },
      },
    ],
  },
  // ── ד ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-dalet', displayChar: 'ד', ttsName: 'דָּלֶת',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 22 L 78 22 Q 80 22 80 38 L 80 115',
        startPoint: { x: 22, y: 22 },
      },
    ],
  },
  // ── ה ────────────────────────────────────────────────────────────────────────
  // Top bar + left leg (partial height), plus inner hanging vertical on right
  {
    id: 'he-hey', displayChar: 'ה', ttsName: 'הֵא',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 80 22 L 22 22 L 22 68', startPoint: { x: 80, y: 22 } }, // top + partial left
      { path: 'M 55 22 L 55 115',         startPoint: { x: 55, y: 22 } }, // inner hanging leg
    ],
  },
  // ── ו ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-vav', displayChar: 'ו', ttsName: 'וָו',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 44 22 Q 58 22 60 34 L 60 115', startPoint: { x: 44, y: 22 } },
    ],
  },
  // ── ז ────────────────────────────────────────────────────────────────────────
  // Top bar right-to-left, then diagonal stem down-left
  {
    id: 'he-zayin', displayChar: 'ז', ttsName: 'זַיִן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 25 22 L 75 22 Q 78 22 78 35 L 58 115',
        startPoint: { x: 25, y: 22 },
      },
    ],
  },
  // ── ח ────────────────────────────────────────────────────────────────────────
  // Arch open at bottom — two full verticals connected at top
  {
    id: 'he-het', displayChar: 'ח', ttsName: 'חֵית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 80 22 L 22 22 L 22 115', startPoint: { x: 80, y: 22 } }, // top + left leg
      { path: 'M 80 22 L 80 115',          startPoint: { x: 80, y: 22 } }, // right leg
    ],
  },
  // ── ט ────────────────────────────────────────────────────────────────────────
  // Rounded container open at top-right, with inner vertical
  {
    id: 'he-tet', displayChar: 'ט', ttsName: 'טֵית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 78 28 Q 15 22 15 68 Q 15 115 50 115 Q 85 115 85 68 Q 85 38 62 28',
        startPoint: { x: 78, y: 28 },
      },
      { path: 'M 50 28 L 50 95', startPoint: { x: 50, y: 28 } },
    ],
  },
  // ── י ────────────────────────────────────────────────────────────────────────
  // Small comma-like stroke — the smallest letter
  {
    id: 'he-yod', displayChar: 'י', ttsName: 'יוֹד',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 42 22 Q 62 22 65 42 Q 68 60 58 72',
        startPoint: { x: 42, y: 22 },
      },
    ],
  },
  // ── כ ────────────────────────────────────────────────────────────────────────
  // Top bar + left leg + curved bottom (open on the right like a backwards C)
  {
    id: 'he-kaf', displayChar: 'כ', ttsName: 'כַּף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 22 L 22 22 L 22 92 Q 22 115 55 115 Q 80 115 80 92',
        startPoint: { x: 80, y: 22 },
      },
    ],
  },
  // ── ל ────────────────────────────────────────────────────────────────────────
  // Ascender above topLine — the tallest Hebrew letter
  {
    id: 'he-lamed', displayChar: 'ל', ttsName: 'לָמֶד',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 58 115 L 58 55 Q 58 22 38 14 Q 20 6 18 22',
        startPoint: { x: 58, y: 115 },
      },
    ],
  },
  // ── מ ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-mem', displayChar: 'מ', ttsName: 'מֵם',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 22 L 22 22 L 22 75 Q 22 98 52 98 Q 80 98 80 75 L 80 98 L 65 115',
        startPoint: { x: 80, y: 22 },
      },
    ],
  },
  // ── נ ────────────────────────────────────────────────────────────────────────
  // Small hook at top-right, vertical down, foot going left
  {
    id: 'he-nun', displayChar: 'נ', ttsName: 'נוּן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 42 22 Q 65 22 68 40 L 68 115 L 22 115',
        startPoint: { x: 42, y: 22 },
      },
    ],
  },
  // ── ס ────────────────────────────────────────────────────────────────────────
  // Closed oval (samech is a complete circle)
  {
    id: 'he-samech', displayChar: 'ס', ttsName: 'סָמֶך',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 50 22 Q 88 22 88 68 Q 88 115 50 115 Q 12 115 12 68 Q 12 22 50 22',
        startPoint: { x: 50, y: 22 },
      },
    ],
  },
  // ── ע ────────────────────────────────────────────────────────────────────────
  // Two curves meeting at the bottom (Y shape)
  {
    id: 'he-ayin', displayChar: 'ע', ttsName: 'עַיִן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 18 22 Q 16 62 44 82 Q 52 88 52 115',
        startPoint: { x: 18, y: 22 },
      },
      {
        path: 'M 82 22 Q 84 62 56 82 Q 52 88 52 115',
        startPoint: { x: 82, y: 22 },
      },
    ],
  },
  // ── פ ────────────────────────────────────────────────────────────────────────
  // Frame with inner rounded head (like a backwards P)
  {
    id: 'he-pe', displayChar: 'פ', ttsName: 'פֵּא',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 22 L 22 22 L 22 115 Q 22 115 80 115 Q 80 115 80 62 Q 80 40 55 40 Q 35 40 22 54',
        startPoint: { x: 80, y: 22 },
      },
    ],
  },
  // ── צ ────────────────────────────────────────────────────────────────────────
  // Two legs with an arch connecting them at top
  {
    id: 'he-tsadi', displayChar: 'צ', ttsName: 'צָדִי',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 22 L 22 92 Q 22 115 52 115 Q 82 115 82 92 L 82 22',
        startPoint: { x: 22, y: 22 },
      },
      {
        path: 'M 22 50 Q 52 22 82 50',
        startPoint: { x: 22, y: 50 },
      },
    ],
  },
  // ── ק ────────────────────────────────────────────────────────────────────────
  // Oval body + right descending leg below baseline
  {
    id: 'he-kuf', displayChar: 'ק', ttsName: 'קוֹף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 50 22 Q 86 22 86 65 Q 86 108 50 108 Q 14 108 14 65 Q 14 22 50 22',
        startPoint: { x: 50, y: 22 },
      },
      { path: 'M 80 68 L 80 132', startPoint: { x: 80, y: 68 } },
    ],
  },
  // ── ר ────────────────────────────────────────────────────────────────────────
  // Top bar + right corner + vertical leg (backwards J shape)
  {
    id: 'he-resh', displayChar: 'ר', ttsName: 'רֵישׁ',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 22 L 78 22 Q 80 22 80 40 L 80 115',
        startPoint: { x: 22, y: 22 },
      },
    ],
  },
  // ── ש ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-shin', displayChar: 'ש', ttsName: 'שִׁין',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 12 22 L 12 85 Q 12 115 50 115 Q 88 115 88 85 L 88 22',
        startPoint: { x: 12, y: 22 },
      },
      { path: 'M 50 72 L 50 115', startPoint: { x: 50, y: 72 } },
    ],
  },
  // ── ת ────────────────────────────────────────────────────────────────────────
  {
    id: 'he-tav', displayChar: 'ת', ttsName: 'תָּו',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 18 22 L 18 115', startPoint: { x: 18, y: 22 } },
      {
        path: 'M 18 22 L 82 22 L 82 78 Q 82 68 52 68 Q 22 68 18 78',
        startPoint: { x: 18, y: 22 },
      },
    ],
  },

  // ── אותיות סופיות ─────────────────────────────────────────────────────────────

  // ── ך (כף סופית) ────────────────────────────────────────────────────────────
  // Like כ but the right/outer leg drops below the baseline
  {
    id: 'he-kaf-sofit', displayChar: 'ך', ttsName: 'כַּף סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 115 L 22 22 L 78 22 L 78 132',
        startPoint: { x: 22, y: 115 },
      },
    ],
  },
  // ── ם (מם סופית) ────────────────────────────────────────────────────────────
  // Closed rectangle (unlike open מ)
  {
    id: 'he-mem-sofit', displayChar: 'ם', ttsName: 'מֵם סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 22 L 20 22 L 20 115 L 80 115 L 80 22',
        startPoint: { x: 80, y: 22 },
      },
    ],
  },
  // ── ן (נון סופית) ────────────────────────────────────────────────────────────
  // Straight vertical with hook at top, drops well below baseline
  {
    id: 'he-nun-sofit', displayChar: 'ן', ttsName: 'נוּן סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 38 22 Q 58 22 62 38 L 62 132',
        startPoint: { x: 38, y: 22 },
      },
    ],
  },
  // ── ף (פא סופית) ────────────────────────────────────────────────────────────
  // Head of פ with a long descender dropping below baseline
  {
    id: 'he-pe-sofit', displayChar: 'ף', ttsName: 'פֵּא סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 22 L 22 22 L 22 115',
        startPoint: { x: 80, y: 22 },
      },
      {
        path: 'M 62 22 L 62 132',
        startPoint: { x: 62, y: 22 },
      },
    ],
  },
  // ── ץ (צדי סופית) ────────────────────────────────────────────────────────────
  // Like צ but both legs descend below baseline
  {
    id: 'he-tsadi-sofit', displayChar: 'ץ', ttsName: 'צָדִי סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 22 L 22 132 M 82 22 L 82 132',
        startPoint: { x: 22, y: 22 },
      },
      {
        path: 'M 22 50 Q 52 22 82 50',
        startPoint: { x: 22, y: 50 },
      },
    ],
  },
]

// ─── Numbers 0–9 ──────────────────────────────────────────────────────────────

export const TRACING_NUMBERS: TracingItem[] = [
  {
    id: 'num-0', displayChar: '0', ttsName: '0',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 50 15 Q 88 15 88 65 Q 88 115 50 115 Q 12 115 12 65 Q 12 15 50 15',
        startPoint: { x: 50, y: 15 },
      },
    ],
  },
  {
    id: 'num-1', displayChar: '1', ttsName: '1',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      { path: 'M 30 32 L 50 15 L 50 115', startPoint: { x: 30, y: 32 } },
    ],
  },
  {
    id: 'num-2', displayChar: '2', ttsName: '2',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 22 38 Q 22 15 50 15 Q 78 15 78 45 Q 78 70 22 115 L 78 115',
        startPoint: { x: 22, y: 38 },
      },
    ],
  },
  {
    id: 'num-3', displayChar: '3', ttsName: '3',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 22 30 Q 22 15 50 15 Q 78 15 78 42 Q 78 65 50 65 Q 78 65 78 88 Q 78 115 50 115 Q 22 115 22 100',
        startPoint: { x: 22, y: 30 },
      },
    ],
  },
  {
    id: 'num-4', displayChar: '4', ttsName: '4',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      { path: 'M 68 15 L 15 82 L 90 82', startPoint: { x: 68, y: 15 } },
      { path: 'M 68 15 L 68 115',         startPoint: { x: 68, y: 15 } },
    ],
  },
  {
    id: 'num-5', displayChar: '5', ttsName: '5',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 75 15 L 20 15 L 20 58 Q 75 46 80 80 Q 80 115 46 115 Q 20 115 15 100',
        startPoint: { x: 75, y: 15 },
      },
    ],
  },
  {
    id: 'num-6', displayChar: '6', ttsName: '6',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 72 22 Q 50 10 22 52 Q 12 80 12 90 Q 12 115 46 115 Q 78 115 78 88 Q 78 62 46 62 Q 12 62 12 90',
        startPoint: { x: 72, y: 22 },
      },
    ],
  },
  {
    id: 'num-7', displayChar: '7', ttsName: '7',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      { path: 'M 18 15 L 85 15 L 35 115', startPoint: { x: 18, y: 15 } },
    ],
  },
  {
    id: 'num-8', displayChar: '8', ttsName: '8',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      // top loop
      {
        path: 'M 50 65 Q 82 65 82 40 Q 82 15 50 15 Q 18 15 18 40 Q 18 65 50 65',
        startPoint: { x: 50, y: 65 },
      },
      // bottom loop
      {
        path: 'M 50 65 Q 82 65 82 90 Q 82 115 50 115 Q 18 115 18 90 Q 18 65 50 65',
        startPoint: { x: 50, y: 65 },
      },
    ],
  },
  {
    id: 'num-9', displayChar: '9', ttsName: '9',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'number',
    strokes: [
      {
        path: 'M 85 50 Q 85 15 50 15 Q 15 15 15 50 Q 15 85 50 85 Q 85 85 85 50 L 85 115',
        startPoint: { x: 85, y: 50 },
      },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the tracing items for a given category and age.
 * Age 3: first 4 items (simpler, low stroke-count).
 * Age 5: all items.
 *
 * The pools are ordered from simplest to most complex, so slicing
 * from the front always gives the most age-appropriate subset.
 */
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
