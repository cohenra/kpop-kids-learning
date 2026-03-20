// ─── Tracing Data ─────────────────────────────────────────────────────────────
//
// SVG paths, start points, and writing-guide lines for letter/number tracing.
//
// Coordinate system: viewBox '0 0 100 140'
//   topLine  = y 15  (tall letters — lamed ascender touches here)
//   midLine  = y 70  (x-height reference)
//   baseLine = y 115 (all letters sit on this line)
//   descLine = y 133 (descenders: ק ף ץ ך ן drop to here)
//
// Hebrew paths reflect standard Israeli BLOCK PRINT (דפוס בלוק) as taught
// in Israeli elementary schools.  Stroke order follows the school convention.
//
// English paths follow Zaner-Bloser manuscript print conventions.

export interface TracingStroke {
  path: string                         // SVG path d= attribute
  startPoint: { x: number; y: number } // pulsing green dot position
}

export interface TracingItem {
  id: string
  displayChar: string        // large hint glyph beside the canvas
  ttsName: string            // spoken via Web Speech API
  strokes: TracingStroke[]   // ordered — child traces one at a time
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
      { path: 'M 20 15 Q 80 15 80 45 Q 80 65 20 65', startPoint: { x: 20, y: 15 } },
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
      { path: 'M 20 15 Q 80 15 80 45 Q 80 65 20 65 L 82 115', startPoint: { x: 20, y: 15 } },
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
      { path: 'M 10 15 L 28 115 L 50 68 L 72 115 L 90 15', startPoint: { x: 10, y: 15 } },
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
      { path: 'M 15 15 L 85 15 L 15 115 L 85 115', startPoint: { x: 15, y: 15 } },
    ],
  },
]

// ─── Hebrew Block Letters — כל האלפבית ────────────────────────────────────────
//
// Every path has been drawn to match standard Israeli block-print (דפוס):
//
//   ב = ⊏  (rectangular bracket, open top-right)
//   ג = reversed-L with small right foot
//   ד = Γ  (horizontal top → right leg down, like ˥)
//   ה = like ח but left leg is shorter + inner hanging leg from roof
//   ח = ∩  (arch open at bottom — both legs reach baseline)
//   כ = C  (open rounded bracket)
//   ל = tall ascending hook above other letters
//   ר = like ד but junction is rounded (like backwards J)
//   ש = U-arch with inner tooth
//   ת = two legs, right leg has inward curved foot
//
// Letters with descenders (ק ף ץ ך ן) drop to y=133 (below baseLine).

export const TRACING_LETTERS_HE: TracingItem[] = [
  // ── א ────────────────────────────────────────────────────────────────────────
  // Main diagonal (upper-right → lower-left) + upper-left arm + lower-right arm
  {
    id: 'he-alef', displayChar: 'א', ttsName: 'אָלֶף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 72 24 L 28 106',  startPoint: { x: 72, y: 24 } },
      { path: 'M 18 28 L 52 55',   startPoint: { x: 18, y: 28 } },
      { path: 'M 48 78 L 80 106',  startPoint: { x: 48, y: 78 } },
    ],
  },
  // ── ב ────────────────────────────────────────────────────────────────────────
  // Rectangular bracket open at the top-right: top bar → left leg → bottom bar
  {
    id: 'he-bet', displayChar: 'ב', ttsName: 'בֵּית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 82 24 L 18 24 L 18 110 L 82 110',
        startPoint: { x: 82, y: 24 },
      },
    ],
  },
  // ── ג ────────────────────────────────────────────────────────────────────────
  // Top bar (right→left) + left leg going down + small right foot at bottom
  {
    id: 'he-gimel', displayChar: 'ג', ttsName: 'גִּימֶל',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 24 L 20 24 L 20 106 L 48 115',
        startPoint: { x: 80, y: 24 },
      },
    ],
  },
  // ── ד ────────────────────────────────────────────────────────────────────────
  // ˥ shape: wide horizontal top (left→right) + right leg down
  {
    id: 'he-dalet', displayChar: 'ד', ttsName: 'דָּלֶת',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 16 24 L 84 24 Q 86 24 86 40 L 86 115',
        startPoint: { x: 16, y: 24 },
      },
    ],
  },
  // ── ה ────────────────────────────────────────────────────────────────────────
  // Top bar + right full leg + left partial leg (stops at mid) + inner hanging stroke
  // Distinguished from ח: left side has a GAP at the bottom
  {
    id: 'he-hey', displayChar: 'ה', ttsName: 'הֵא',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 84 24 L 18 24 L 18 65', startPoint: { x: 84, y: 24 } },  // top bar + partial left
      { path: 'M 84 24 L 84 115',         startPoint: { x: 84, y: 24 } },  // right full leg
      { path: 'M 52 24 L 52 115',          startPoint: { x: 52, y: 24 } },  // inner hanging leg
    ],
  },
  // ── ו ────────────────────────────────────────────────────────────────────────
  // Small hook/serif at top-right, then straight line down
  {
    id: 'he-vav', displayChar: 'ו', ttsName: 'וָו',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 40 24 Q 58 24 60 38 L 60 115', startPoint: { x: 40, y: 24 } },
    ],
  },
  // ── ז ────────────────────────────────────────────────────────────────────────
  // Horizontal top bar (left→right, with right corner hook) + diagonal going down-left
  {
    id: 'he-zayin', displayChar: 'ז', ttsName: 'זַיִן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 22 24 L 78 24 Q 82 24 80 40 L 58 115',
        startPoint: { x: 22, y: 24 },
      },
    ],
  },
  // ── ח ────────────────────────────────────────────────────────────────────────
  // ∩ arch open at bottom — BOTH legs go all the way to baseline (unlike ה)
  {
    id: 'he-het', displayChar: 'ח', ttsName: 'חֵית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 84 24 L 18 24 L 18 115', startPoint: { x: 84, y: 24 } },
      { path: 'M 84 24 L 84 115',           startPoint: { x: 84, y: 24 } },
    ],
  },
  // ── ט ────────────────────────────────────────────────────────────────────────
  // Rounded container open at top-right + inner vertical stroke
  {
    id: 'he-tet', displayChar: 'ט', ttsName: 'טֵית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 80 30 Q 16 20 16 68 Q 16 115 50 115 Q 84 115 84 68 Q 84 36 64 26',
        startPoint: { x: 80, y: 30 },
      },
      { path: 'M 50 26 L 50 96', startPoint: { x: 50, y: 26 } },
    ],
  },
  // ── י ────────────────────────────────────────────────────────────────────────
  // Tiny comma-like stroke — the smallest Hebrew letter
  {
    id: 'he-yod', displayChar: 'י', ttsName: 'יוֹד',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 38 24 Q 64 24 66 44 Q 68 64 55 74',
        startPoint: { x: 38, y: 24 },
      },
    ],
  },
  // ── כ ────────────────────────────────────────────────────────────────────────
  // C shape (open on the right) — rounded bracket
  {
    id: 'he-kaf', displayChar: 'כ', ttsName: 'כַּף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 84 36 Q 84 24 50 24 Q 16 24 16 68 Q 16 115 50 115 Q 84 115 84 96',
        startPoint: { x: 84, y: 36 },
      },
    ],
  },
  // ── ל ────────────────────────────────────────────────────────────────────────
  // Tall letter — ascender curves above topLine. Start at baseline, go up then curve right.
  {
    id: 'he-lamed', displayChar: 'ל', ttsName: 'לָמֶד',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 60 115 L 60 52 Q 60 22 40 13 Q 20 5 18 22',
        startPoint: { x: 60, y: 115 },
      },
    ],
  },
  // ── מ ────────────────────────────────────────────────────────────────────────
  // Top bar + left leg + curved bottom + inner loop + tail going down-right
  {
    id: 'he-mem', displayChar: 'מ', ttsName: 'מֵם',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 84 24 L 18 24 L 18 78 Q 18 100 50 100 Q 84 100 84 78 L 84 100 L 66 115',
        startPoint: { x: 84, y: 24 },
      },
    ],
  },
  // ── נ ────────────────────────────────────────────────────────────────────────
  // Small right hook at top, body down on the right, foot going LEFT at baseline
  {
    id: 'he-nun', displayChar: 'נ', ttsName: 'נוּן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 40 24 Q 66 24 68 42 L 68 115 L 18 115',
        startPoint: { x: 40, y: 24 },
      },
    ],
  },
  // ── ס ────────────────────────────────────────────────────────────────────────
  // Closed oval — like the letter O
  {
    id: 'he-samech', displayChar: 'ס', ttsName: 'סָמֶך',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 50 24 Q 86 24 86 68 Q 86 115 50 115 Q 14 115 14 68 Q 14 24 50 24',
        startPoint: { x: 50, y: 24 },
      },
    ],
  },
  // ── ע ────────────────────────────────────────────────────────────────────────
  // Two legs that curve inward and meet at a single point at the bottom
  {
    id: 'he-ayin', displayChar: 'ע', ttsName: 'עַיִן',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 16 24 Q 12 65 42 85 Q 50 90 50 115', startPoint: { x: 16, y: 24 } },
      { path: 'M 84 24 Q 88 65 58 85 Q 50 90 50 115', startPoint: { x: 84, y: 24 } },
    ],
  },
  // ── פ ────────────────────────────────────────────────────────────────────────
  // Outer frame (top bar + left leg + bottom bar) + inner rounded head at top-right
  {
    id: 'he-pe', displayChar: 'פ', ttsName: 'פֵּא',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 84 24 L 18 24 L 18 115 L 84 115 Q 84 115 84 64 Q 84 42 56 42 Q 36 42 18 56',
        startPoint: { x: 84, y: 24 },
      },
    ],
  },
  // ── צ ────────────────────────────────────────────────────────────────────────
  // U-shape connecting two legs at the bottom + arch at the top
  {
    id: 'he-tsadi', displayChar: 'צ', ttsName: 'צָדִי',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 18 24 L 18 96 Q 18 115 50 115 Q 82 115 82 96 L 82 24',
        startPoint: { x: 18, y: 24 },
      },
      { path: 'M 18 52 Q 50 24 82 52', startPoint: { x: 18, y: 52 } },
    ],
  },
  // ── ק ────────────────────────────────────────────────────────────────────────
  // Oval body + right leg that drops BELOW the baseline (descender)
  {
    id: 'he-kuf', displayChar: 'ק', ttsName: 'קוֹף',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 50 24 Q 86 24 86 68 Q 86 110 50 110 Q 14 110 14 68 Q 14 24 50 24',
        startPoint: { x: 50, y: 24 },
      },
      { path: 'M 82 68 L 82 133', startPoint: { x: 82, y: 68 } },
    ],
  },
  // ── ר ────────────────────────────────────────────────────────────────────────
  // Horizontal top (left→right) + rounded corner + right leg down
  // (like ד but with a smooth rounded shoulder instead of sharp corner)
  {
    id: 'he-resh', displayChar: 'ר', ttsName: 'רֵישׁ',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 16 24 L 80 24 Q 86 24 86 50 L 86 115',
        startPoint: { x: 16, y: 24 },
      },
    ],
  },
  // ── ש ────────────────────────────────────────────────────────────────────────
  // U-arch (like צ outer shape) + middle tooth hanging from the top
  {
    id: 'he-shin', displayChar: 'ש', ttsName: 'שִׁין',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 12 24 L 12 86 Q 12 115 50 115 Q 88 115 88 86 L 88 24',
        startPoint: { x: 12, y: 24 },
      },
      { path: 'M 50 72 L 50 115', startPoint: { x: 50, y: 72 } },
    ],
  },
  // ── ת ────────────────────────────────────────────────────────────────────────
  // Left leg (full, straight) + top bar + right leg that ends with a curved inward foot
  {
    id: 'he-tav', displayChar: 'ת', ttsName: 'תָּו',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 18 24 L 18 115', startPoint: { x: 18, y: 24 } },
      {
        path: 'M 18 24 L 84 24 L 84 80 Q 84 95 65 98 Q 48 100 42 90',
        startPoint: { x: 18, y: 24 },
      },
    ],
  },

  // ── אותיות סופיות ─────────────────────────────────────────────────────────────

  // ── ך (כף סופית) ────────────────────────────────────────────────────────────
  // Like כ but the leg drops straight below the baseline (no bottom curve)
  {
    id: 'he-kaf-sofit', displayChar: 'ך', ttsName: 'כַּף סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 84 36 Q 84 24 50 24 Q 16 24 16 68 L 16 115', startPoint: { x: 84, y: 36 } },
      { path: 'M 84 24 L 84 133', startPoint: { x: 84, y: 24 } },
    ],
  },
  // ── ם (מם סופית) ────────────────────────────────────────────────────────────
  // Closed rectangle (unlike open מ — this one is a sealed box)
  {
    id: 'he-mem-sofit', displayChar: 'ם', ttsName: 'מֵם סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 84 24 L 16 24 L 16 115 L 84 115 L 84 24',
        startPoint: { x: 84, y: 24 },
      },
    ],
  },
  // ── ן (נון סופית) ────────────────────────────────────────────────────────────
  // Hook at top, straight vertical going well below baseline — no foot
  {
    id: 'he-nun-sofit', displayChar: 'ן', ttsName: 'נוּן סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      {
        path: 'M 36 24 Q 62 24 65 42 L 65 133',
        startPoint: { x: 36, y: 24 },
      },
    ],
  },
  // ── ף (פא סופית) ────────────────────────────────────────────────────────────
  // Head of פ + a long central leg that drops below the baseline
  {
    id: 'he-pe-sofit', displayChar: 'ף', ttsName: 'פֵּא סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 84 24 L 18 24 L 18 115', startPoint: { x: 84, y: 24 } },
      { path: 'M 65 24 L 65 133',           startPoint: { x: 65, y: 24 } },
    ],
  },
  // ── ץ (צדי סופית) ────────────────────────────────────────────────────────────
  // Like צ but both legs drop below the baseline
  {
    id: 'he-tsadi-sofit', displayChar: 'ץ', ttsName: 'צָדִי סוֹפִית',
    viewBox: VB, topLine: TOP, midLine: MID, baseLine: BASE, category: 'letter-he',
    strokes: [
      { path: 'M 18 24 L 18 133', startPoint: { x: 18, y: 24 } },
      { path: 'M 82 24 L 82 133', startPoint: { x: 82, y: 24 } },
      { path: 'M 18 54 Q 50 24 82 54', startPoint: { x: 18, y: 54 } },
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
      {
        path: 'M 50 65 Q 82 65 82 40 Q 82 15 50 15 Q 18 15 18 40 Q 18 65 50 65',
        startPoint: { x: 50, y: 65 },
      },
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
 * Returns tracing items for a given category and age.
 * Age 3: first 4 items (simpler, lower stroke count).
 * Age 5: all items.
 * Pools are ordered simplest → most complex, so slicing from the front
 * always gives the most age-appropriate subset.
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
