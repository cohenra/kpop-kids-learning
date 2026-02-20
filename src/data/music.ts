// ─── Music Room Data ──────────────────────────────────────────────────────────
//
// Dance Studio — "The Choreography Room"
// 4 games: Rhythm Tap, Instrument Recognition, Melody Sequence, Free Piano

export type Language = 'he' | 'en'
export type AgeProfile = 3 | 5

// ─── Shared constants ─────────────────────────────────────────────────────────

export const SPARKS_PER_ROUND = 15       // Rhythm Tap: per successful round
export const SPARKS_COMPLETION_BONUS = 30 // Instrument / Melody completion bonus
export const FREE_PIANO_SPARKS = 30      // Awarded after 10 notes in Free Play
export const INSTRUMENT_SPARKS_PER_ROUND = 10
export const MELODY_SPARKS_PER_ROUND = 10
export const MELODY_SPARKS_BONUS = 40
export const PUZZLE_COMPLETION_SPARKS = 40
export const MEMORY_COMPLETION_SPARKS = 50
export const ODDONE_SPARKS_PER_ROUND = 10
export const SHADOW_SPARKS_PER_ROUND = 10

// ─── Rhythm Tap ───────────────────────────────────────────────────────────────

export interface RhythmConfig {
  bpm: number
  beats: number
  toleranceMs: number
  label: string
}

export const RHYTHM_CONFIGS: Record<AgeProfile, RhythmConfig> = {
  3: { bpm: 60,  beats: 4, toleranceMs: 400, label: 'Slow & Steady' },
  5: { bpm: 90,  beats: 8, toleranceMs: 250, label: 'Pop Beat'      },
}

export function getBeatIntervalMs(bpm: number): number {
  return Math.round(60_000 / bpm)
}

// ─── Instrument Recognition ────────────────────────────────────────────────────

export interface InstrumentDef {
  id: string
  nameHe: string
  nameEn: string
  emoji: string
  // Web Audio synthesis params
  synth: 'drum' | 'piano' | 'guitar' | 'trumpet'
}

export const INSTRUMENTS: InstrumentDef[] = [
  { id: 'drum',    nameHe: 'תוף',        nameEn: 'Drum',    emoji: '🥁', synth: 'drum'    },
  { id: 'piano',   nameHe: 'פסנתר',      nameEn: 'Piano',   emoji: '🎹', synth: 'piano'   },
  { id: 'guitar',  nameHe: 'גיטרה',      nameEn: 'Guitar',  emoji: '🎸', synth: 'guitar'  },
  { id: 'trumpet', nameHe: 'חצוצרה',     nameEn: 'Trumpet', emoji: '🎺', synth: 'trumpet' },
]

export function getInstrumentRounds(age: AgeProfile): InstrumentDef[] {
  // Age 3: only 2 instruments (drum + piano), 8 rounds
  // Age 5: all 4 instruments, 10 rounds
  const pool = age === 3 ? INSTRUMENTS.slice(0, 2) : INSTRUMENTS
  const rounds: InstrumentDef[] = []
  const count = age === 3 ? 8 : 10
  for (let i = 0; i < count; i++) {
    rounds.push(pool[i % pool.length])
  }
  // Shuffle order
  return rounds.sort(() => Math.random() - 0.5)
}

export function getInstrumentChoices(
  correct: InstrumentDef,
  age: AgeProfile,
): InstrumentDef[] {
  const pool = age === 3 ? INSTRUMENTS.slice(0, 2) : INSTRUMENTS
  const others = pool.filter((i) => i.id !== correct.id)
  const count = age === 3 ? 1 : 3
  const distractors = others.sort(() => Math.random() - 0.5).slice(0, count)
  return [...distractors, correct].sort(() => Math.random() - 0.5)
}

// ─── Melody Sequence ──────────────────────────────────────────────────────────

export interface NoteColor {
  id: string
  colorHex: string
  label: string        // note name shown on button
  frequency: number    // Hz for Web Audio
}

// 5 distinct colors + pitches (C4–G4)
export const NOTE_COLORS: NoteColor[] = [
  { id: 'red',    colorHex: '#EC4899', label: 'C', frequency: 261.63 },
  { id: 'yellow', colorHex: '#F59E0B', label: 'D', frequency: 293.66 },
  { id: 'green',  colorHex: '#10B981', label: 'E', frequency: 329.63 },
  { id: 'blue',   colorHex: '#06B6D4', label: 'F', frequency: 349.23 },
  { id: 'purple', colorHex: '#7C3AED', label: 'G', frequency: 392.00 },
]

export interface MelodyRound {
  sequence: NoteColor[]   // The sequence to play and repeat
  roundNumber: number
}

export function getMelodyRounds(age: AgeProfile): MelodyRound[] {
  const pool = age === 3 ? NOTE_COLORS.slice(0, 3) : NOTE_COLORS
  const totalRounds = 8
  const rounds: MelodyRound[] = []

  for (let r = 0; r < totalRounds; r++) {
    // Sequence length: age 3 always 2; age 5: starts 2, grows to 4
    const seqLen = age === 3 ? 2 : Math.min(4, 2 + Math.floor(r / 3))
    const sequence: NoteColor[] = []
    for (let i = 0; i < seqLen; i++) {
      sequence.push(pool[Math.floor(Math.random() * pool.length)])
    }
    rounds.push({ sequence, roundNumber: r + 1 })
  }
  return rounds
}

// ─── Free Piano ───────────────────────────────────────────────────────────────

export interface PianoKey {
  note: string
  labelHe: string
  labelEn: string
  frequency: number
  colorHex: string
}

// Full 8-key C major scale
export const PIANO_KEYS_FULL: PianoKey[] = [
  { note: 'C4', labelHe: 'דו',  labelEn: 'C', frequency: 261.63, colorHex: '#EC4899' },
  { note: 'D4', labelHe: 'רה',  labelEn: 'D', frequency: 293.66, colorHex: '#F59E0B' },
  { note: 'E4', labelHe: 'מי',  labelEn: 'E', frequency: 329.63, colorHex: '#10B981' },
  { note: 'F4', labelHe: 'פה',  labelEn: 'F', frequency: 349.23, colorHex: '#06B6D4' },
  { note: 'G4', labelHe: 'סול', labelEn: 'G', frequency: 392.00, colorHex: '#7C3AED' },
  { note: 'A4', labelHe: 'לה',  labelEn: 'A', frequency: 440.00, colorHex: '#8B5CF6' },
  { note: 'B4', labelHe: 'סי',  labelEn: 'B', frequency: 493.88, colorHex: '#F472B6' },
  { note: 'C5', labelHe: 'דו',  labelEn: 'C', frequency: 523.25, colorHex: '#EC4899' },
]

// Age 3: only 5 keys (pentatonic — avoids half-steps, always sounds good)
export const PIANO_KEYS_AGE3: PianoKey[] = PIANO_KEYS_FULL.filter(
  (k) => ['C4', 'D4', 'E4', 'G4', 'A4'].includes(k.note)
)

export function getPianoKeys(age: AgeProfile): PianoKey[] {
  return age === 3 ? PIANO_KEYS_AGE3 : PIANO_KEYS_FULL
}
