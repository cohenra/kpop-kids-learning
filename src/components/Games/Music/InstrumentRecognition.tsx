import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import { Character } from '../../Character/Character'
import { SparkCounter } from '../../UI/SparkCounter'
import { t } from '../../../i18n/strings'
import {
  INSTRUMENTS,
  INSTRUMENT_SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  getInstrumentRounds,
  getInstrumentChoices,
  type InstrumentDef,
} from '../../../data/music'

// ─── Game 2: Instrument Recognition ─────────────────────────────────────────
//
// Synthesised instrument sound plays → child picks the correct instrument.
// Age 3: 2 instruments (drum + piano), 8 rounds
// Age 5: 4 instruments, 10 rounds
// +10 sparks per correct answer, +30 completion bonus

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

// ── Web Audio Synth helpers ───────────────────────────────────────────────────

function playDrum() {
  try {
    const ctx = new AudioContext()
    // Kick drum: pitched noise burst + low sine thud
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03))
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    noise.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.8, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
  } catch { /* silent */ }
}

function playPiano() {
  try {
    const ctx = new AudioContext()
    // Piano chord: two detuned sines at C major (C4 + E4 + G4)
    const freqs = [261.63, 329.63, 392.00]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.02)
      osc.stop(ctx.currentTime + 1.0)
    })
  } catch { /* silent */ }
}

function playGuitar() {
  try {
    const ctx = new AudioContext()
    // Guitar pluck: sawtooth with fast decay → string-like
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = 196 // G3
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 1200

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.7)
  } catch { /* silent */ }
}

function playTrumpet() {
  try {
    const ctx = new AudioContext()
    // Trumpet: buzzy square + attack swell
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 440 // A4 fanfare note
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.06)  // attack
    gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 880
    filter.Q.value = 2

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch { /* silent */ }
}

function playInstrumentSound(synth: InstrumentDef['synth']) {
  switch (synth) {
    case 'drum':    playDrum();    break
    case 'piano':   playPiano();   break
    case 'guitar':  playGuitar();  break
    case 'trumpet': playTrumpet(); break
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InstrumentRecognition({ onComplete, onBack }: Props) {
  const { language, isRTL, age, activeProfile } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()
  const s = t(language)

  const rounds = getInstrumentRounds(age)
  const totalRounds = rounds.length

  const [roundIdx, setRoundIdx] = useState(0)
  const [choices, setChoices] = useState<InstrumentDef[]>(() =>
    getInstrumentChoices(rounds[0], age)
  )
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [sparksEarned, setSparksEarned] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('happy')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [played, setPlayed] = useState(false)

  const currentInstrument = rounds[roundIdx]

  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899'

  // Speak instruction on mount + round change
  useEffect(() => {
    const msg = isRTL
      ? 'האזיני לצליל ובחרי את הכלי הנכון!'
      : 'Listen to the sound and pick the instrument!'
    const timer = setTimeout(() => say(msg), 400)
    return () => clearTimeout(timer)
  }, [roundIdx, isRTL, say])

  const handlePlaySound = useCallback(() => {
    playInstrumentSound(currentInstrument.synth)
    setPlayed(true)
  }, [currentInstrument])

  // Auto-play on each new round
  useEffect(() => {
    setPlayed(false)
    const timer = setTimeout(() => {
      playInstrumentSound(currentInstrument.synth)
      setPlayed(true)
    }, 700)
    return () => clearTimeout(timer)
  }, [roundIdx, currentInstrument])

  const handleAnswer = (instrument: InstrumentDef) => {
    if (revealed) return
    setSelectedId(instrument.id)
    setRevealed(true)

    const isCorrect = instrument.id === currentInstrument.id

    if (isCorrect) {
      setCorrect(true)
      setMood('excited')
      playCorrect()
      const earned = INSTRUMENT_SPARKS_PER_ROUND
      const newTotal = sparksEarned + earned
      setSparksEarned(newTotal)
      setShowCelebration(true)

      setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        advanceRound(newTotal)
      }, 1400)
    } else {
      setCorrect(false)
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      setTimeout(() => {
        setShowEncouragement(false)
        setMood('happy')
        // Show correct answer briefly then advance
        setTimeout(() => advanceRound(sparksEarned), 800)
      }, 1600)
    }
  }

  const advanceRound = (currentSparks: number) => {
    const nextIdx = roundIdx + 1
    if (nextIdx >= totalRounds) {
      // All rounds done
      const finalSparks = currentSparks + SPARKS_COMPLETION_BONUS
      completeGame('music', 'instrument-recognition', 100)
      setTimeout(() => {
        playSpark()
        onComplete(finalSparks)
      }, 300)
    } else {
      setRoundIdx(nextIdx)
      setChoices(getInstrumentChoices(rounds[nextIdx], age))
      setRevealed(false)
      setSelectedId(null)
      setCorrect(false)
      setMood('happy')
    }
  }

  // All instruments available in full list (for name display)
  void INSTRUMENTS

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1A1030 0%, #0D0B1A 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <motion.button
          className="flex items-center gap-1.5 text-white/60 font-bold
                     bg-white/5 px-3 py-2 rounded-full border border-white/10"
          whileTap={{ scale: 0.93 }}
          onClick={onBack}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          <span>{isRTL ? '→' : '←'}</span> {s.back}
        </motion.button>

        <h1 className="font-bold text-white text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
          🎸 {isRTL ? 'זיהוי כלי נגינה' : 'Instruments'}
        </h1>
        <SparkCounter />
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 justify-center px-6 py-2">
        {rounds.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{
              background: i < roundIdx
                ? '#F59E0B'
                : i === roundIdx
                ? '#EC4899'
                : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 pb-6">
        <CelebrationOverlay
          show={showCelebration}
          message={isRTL ? 'כן! זה הכלי הנכון! 🎵' : 'Yes! That\'s the right instrument! 🎵'}
          sparksEarned={INSTRUMENT_SPARKS_PER_ROUND}
        />
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'כמעט! תאזיני שוב!' : 'Almost! Listen again!'}
        />

        {/* Round counter */}
        <p className="text-white/40 text-sm" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
          {isRTL ? `סיבוב ${roundIdx + 1} מתוך ${totalRounds}` : `Round ${roundIdx + 1} of ${totalRounds}`}
        </p>

        {/* Big play button */}
        <motion.button
          className="rounded-full flex items-center justify-center"
          style={{
            width: age === 3 ? 160 : 140,
            height: age === 3 ? 160 : 140,
            background: played
              ? 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, rgba(124,58,237,0.2) 70%)'
              : 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            border: '3px solid',
            borderColor: played ? '#EC4899' : 'rgba(255,255,255,0.2)',
            boxShadow: played ? '0 0 50px rgba(236,72,153,0.5)' : '0 0 15px rgba(255,255,255,0.05)',
          }}
          whileTap={{ scale: 0.93 }}
          animate={played ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.3 }}
          onClick={handlePlaySound}
        >
          <span style={{ fontSize: 64 }}>🔊</span>
        </motion.button>

        <p className="text-white/50 text-base" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
          {isRTL ? 'לחצי להאזין שוב' : 'Tap to listen again'}
        </p>

        {/* Choices */}
        <div className={`grid gap-3 w-full max-w-xs ${age === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          <AnimatePresence mode="popLayout">
            {choices.map((inst, i) => {
              const isSelected = selectedId === inst.id
              const isAnswer = revealed && inst.id === currentInstrument.id
              const isWrong = revealed && isSelected && !correct

              return (
                <motion.button
                  key={`${roundIdx}-${inst.id}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
                  className="rounded-3xl flex flex-col items-center justify-center gap-2 border-2"
                  style={{
                    minHeight: age === 3 ? 110 : 100,
                    background: isAnswer
                      ? 'rgba(16,185,129,0.25)'
                      : isWrong
                      ? 'rgba(239,68,68,0.2)'
                      : isSelected
                      ? 'rgba(236,72,153,0.2)'
                      : 'rgba(255,255,255,0.06)',
                    borderColor: isAnswer
                      ? '#10B981'
                      : isWrong
                      ? '#EF4444'
                      : isSelected
                      ? '#EC4899'
                      : 'rgba(255,255,255,0.15)',
                    boxShadow: isAnswer
                      ? '0 0 20px rgba(16,185,129,0.4)'
                      : isWrong
                      ? '0 0 15px rgba(239,68,68,0.3)'
                      : 'none',
                  }}
                  whileTap={!revealed ? { scale: 0.93 } : {}}
                  onClick={() => handleAnswer(inst)}
                  disabled={revealed}
                >
                  <span style={{ fontSize: age === 3 ? 42 : 36 }}>{inst.emoji}</span>
                  <span
                    className="font-bold text-white text-sm text-center px-1"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                  >
                    {language === 'he' ? inst.nameHe : inst.nameEn}
                  </span>
                  {isAnswer && revealed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 text-lg"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Character */}
        <Character mood={mood} size={90} hairColor={hairColor} outfitColor={outfitColor} />
      </div>
    </div>
  )
}
