// ─── K-POP Web Audio Synth Engine ─────────────────────────────────────────────
//
// Generates a ~24 second instrumental with:
//   - Kick + snare + hi-hat pattern (tempo matches rhythm choice)
//   - Bass line (root notes of chord progression)
//   - Pad chords (triangle oscillators, soft attack)
//   - Lead melody (sawtooth, theme-based pentatonic pattern)
//
// Returns a stop() function and lyric line timestamps (ms from start).
//
// chord progressions by feeling:
//   happy  → C–G–Am–F  (major pop)
//   strong → C–G–C–G   (anthemic power)
//   dreamy → Am–F–C–G  (minor romantic)
//
// melody patterns by theme (intervals above chord root):
//   stars   → ascending bright
//   friends → stepwise friendly
//   dance   → syncopated rhythmic
//
// BPM by rhythm: fast=138, slow=75, bouncy=118

// ─── Note frequency table ──────────────────────────────────────────────────────

const NOTE: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
  G2: 98.00,  A2: 110.00, F2: 87.31,
}

// ─── Chord voicings ────────────────────────────────────────────────────────────

type ChordName = 'C' | 'G' | 'Am' | 'F'

const CHORD_VOICINGS: Record<ChordName, number[]> = {
  C:  [NOTE.C4, NOTE.E4, NOTE.G4],
  G:  [NOTE.G3, NOTE.B3, NOTE.D4],
  Am: [NOTE.A3, NOTE.C4, NOTE.E4],
  F:  [NOTE.F3, NOTE.A3, NOTE.C4],
}

const BASS_ROOTS: Record<ChordName, number> = {
  C:  NOTE.C3,
  G:  NOTE.G2,
  Am: NOTE.A2,
  F:  NOTE.F2,
}

// ─── Chord progressions by feeling ────────────────────────────────────────────

const CHORD_PROGRESSIONS: Record<string, ChordName[]> = {
  happy:  ['C', 'G', 'Am', 'F'],
  strong: ['C', 'G', 'C',  'G'],
  dreamy: ['Am', 'F', 'C', 'G'],
}

// ─── BPM by rhythm ─────────────────────────────────────────────────────────────

const BPM_MAP: Record<string, number> = {
  fast:   138,
  slow:   75,
  bouncy: 118,
}

// ─── Melody patterns (offsets in semitones above root) ────────────────────────
// Each pattern is 8 steps (1 per beat for 2 bars)

function semitoneToFreq(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12)
}

const MELODY_PATTERNS: Record<string, number[]> = {
  stars:   [0, 4, 7, 12, 7, 4, 0, 7],   // ascending bright pentatonic
  friends: [0, 2, 4, 2, 0, 2, 4, 5],   // stepwise friendly
  dance:   [0, 7, 0, 5, 4, 0, 7, 4],   // syncopated rhythmic
}

// ─── Helper: play a single note ───────────────────────────────────────────────

function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  dur: number,
  type: OscillatorType,
  vol: number,
  oscs: OscillatorNode[]
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur)
  osc.start(startTime)
  osc.stop(startTime + dur + 0.01)
  oscs.push(osc)
}

// ─── Helper: kick drum (frequency sweep) ─────────────────────────────────────

function playKick(ctx: AudioContext, startTime: number, oscs: OscillatorNode[]): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(90, startTime)
  osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.15)
  gain.gain.setValueAtTime(0.4, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)
  osc.start(startTime)
  osc.stop(startTime + 0.16)
  oscs.push(osc)
}

// ─── Helper: snare (square osc, short) ───────────────────────────────────────

function playSnare(ctx: AudioContext, startTime: number, oscs: OscillatorNode[]): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'square'
  osc.frequency.value = 180
  gain.gain.setValueAtTime(0.18, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12)
  osc.start(startTime)
  osc.stop(startTime + 0.13)
  oscs.push(osc)
}

// ─── Helper: hi-hat (high square, very short) ─────────────────────────────────

function playHihat(ctx: AudioContext, startTime: number, oscs: OscillatorNode[]): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'square'
  osc.frequency.value = 7500
  gain.gain.setValueAtTime(0.05, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03)
  osc.start(startTime)
  osc.stop(startTime + 0.04)
  oscs.push(osc)
}

// ─── Helper: pad chord (3 triangle oscillators, soft attack) ──────────────────

function playPadChord(
  ctx: AudioContext,
  freqs: number[],
  startTime: number,
  dur: number,
  oscs: OscillatorNode[]
): void {
  freqs.forEach((freq) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(0.08, startTime + 0.5)
    gain.gain.setValueAtTime(0.08, startTime + dur - 0.1)
    gain.gain.linearRampToValueAtTime(0, startTime + dur)
    osc.start(startTime)
    osc.stop(startTime + dur + 0.01)
    oscs.push(osc)
  })
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface SynthResult {
  stop: () => void
  lyricTimesMs: number[]   // when each of 6 lyric lines should appear
  durationMs: number
}

export function playSynthSong(
  opts: { feeling: string; rhythm: string; theme: string },
  ctx: AudioContext
): SynthResult {
  const bpm = BPM_MAP[opts.rhythm] ?? 118
  const beatSec = 60 / bpm
  const barSec = beatSec * 4          // 4 beats per bar
  const totalBars = 8
  const totalBeats = totalBars * 4    // 32 beats
  const durationSec = totalBeats * beatSec
  const durationMs = Math.round(durationSec * 1000)

  const prog: ChordName[] = CHORD_PROGRESSIONS[opts.feeling] ?? CHORD_PROGRESSIONS.happy
  const melodyPattern = MELODY_PATTERNS[opts.theme] ?? MELODY_PATTERNS.stars

  const oscs: OscillatorNode[] = []
  const now = ctx.currentTime

  // ── Schedule all 32 beats ──────────────────────────────────────────────────
  for (let beat = 0; beat < totalBeats; beat++) {
    const t = now + beat * beatSec
    const posInBar = beat % 4

    // Which chord are we on? Chord changes every 2 bars (8 beats)
    const chordIdx = Math.floor(beat / 8) % prog.length
    const chord = prog[chordIdx]
    const chordFreqs = CHORD_VOICINGS[chord]
    const bassFreq = BASS_ROOTS[chord]

    // Kick: beats 0 and 2 of each bar
    if (posInBar === 0 || posInBar === 2) {
      playKick(ctx, t, oscs)
    }

    // Snare: beats 1 and 3 of each bar
    if (posInBar === 1 || posInBar === 3) {
      playSnare(ctx, t, oscs)
    }

    // Hi-hat: every beat
    playHihat(ctx, t, oscs)

    // Pad chord: attack at start of each bar (beat 0 of bar), sustain full bar
    if (posInBar === 0) {
      playPadChord(ctx, chordFreqs, t, barSec - 0.05, oscs)
    }

    // Bass: root note, accent on beat 0 and a lighter hit on beat 2
    if (posInBar === 0) {
      playNote(ctx, bassFreq, t, beatSec * 1.8, 'sine', 0.25, oscs)
    } else if (posInBar === 2) {
      playNote(ctx, bassFreq, t, beatSec * 0.9, 'sine', 0.15, oscs)
    }

    // Melody: sawtooth, 1 note per beat based on pattern
    const melodyStep = beat % melodyPattern.length
    const semitones = melodyPattern[melodyStep]
    const melodyFreq = semitoneToFreq(chordFreqs[0], semitones)
    playNote(ctx, melodyFreq, t, beatSec * 0.55, 'sawtooth', 0.12, oscs)
  }

  // ── Lyric timestamps: bars 1, 2, 3, 5, 6, 7 start times ──────────────────
  // Bar indices are 0-based. Bar N starts at beat N*4.
  const lyricBars = [0, 1, 2, 4, 5, 6]
  const lyricTimesMs = lyricBars.map((bar) =>
    Math.round(bar * barSec * 1000)
  )

  const stop = () => {
    oscs.forEach((osc) => {
      try { osc.stop() } catch { /* already stopped */ }
    })
  }

  return { stop, lyricTimesMs, durationMs }
}
