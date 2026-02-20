import { useState, useCallback, useEffect, useRef } from 'react'
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
  getMelodyRounds,
  NOTE_COLORS,
  MELODY_SPARKS_PER_ROUND,
  MELODY_SPARKS_BONUS,
  type NoteColor,
} from '../../../data/music'

// ─── Game 3: Melody Sequence ──────────────────────────────────────────────────
//
// Computer plays a short note sequence on colored buttons → child repeats it.
// Age 3: 2 notes, 3 colors
// Age 5: up to 4 notes, 5 colors, grows per round
// 8 rounds, +10 sparks per round, +40 completion bonus

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type Phase = 'watching' | 'playing' | 'result'

// ── Web Audio tone ────────────────────────────────────────────────────────────

function playNote(frequency: number, duration = 0.35) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.02)
    gain.gain.setValueAtTime(0.35, ctx.currentTime + duration - 0.06)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch { /* silent */ }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MelodySequence({ onComplete, onBack }: Props) {
  const { language, isRTL, age, activeProfile } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()
  const s = t(language)

  const rounds = getMelodyRounds(age)
  const totalRounds = rounds.length
  const notePool = age === 3 ? NOTE_COLORS.slice(0, 3) : NOTE_COLORS

  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('watching')
  const [litNoteId, setLitNoteId] = useState<string | null>(null)
  const [playerInput, setPlayerInput] = useState<NoteColor[]>([])
  const [sparksEarned, setSparksEarned] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('happy')

  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899'

  const currentRound = rounds[roundIdx]
  const sequence = currentRound.sequence

  // ── Play the sequence for the child to watch ──────────────────────────────
  const playSequence = useCallback(() => {
    setPhase('watching')
    setPlayerInput([])
    setLitNoteId(null)

    const SEQ_DELAY = 600 // ms between notes
    sequence.forEach((note, i) => {
      playbackTimerRef.current = setTimeout(() => {
        playNote(note.frequency)
        setLitNoteId(note.id)
        setTimeout(() => setLitNoteId(null), SEQ_DELAY - 100)

        if (i === sequence.length - 1) {
          // Sequence done — let child play
          setTimeout(() => {
            setPhase('playing')
            const msg = isRTL ? 'עכשיו תורך! חזרי על הנגינה!' : 'Your turn! Repeat the melody!'
            say(msg)
          }, SEQ_DELAY + 100)
        }
      }, i * SEQ_DELAY + 300)
    })
  }, [sequence, isRTL, say])

  // Auto-play on round start
  useEffect(() => {
    const msg = isRTL
      ? 'הקשיבי לנגינה ואחר כך חזרי!'
      : 'Listen to the melody then repeat it!'
    const timer = setTimeout(() => {
      say(msg)
      setTimeout(playSequence, 800)
    }, 300)
    return () => {
      clearTimeout(timer)
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current)
    }
  }, [roundIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNotePress = (note: NoteColor) => {
    if (phase !== 'playing') return
    playNote(note.frequency)
    setLitNoteId(note.id)
    setTimeout(() => setLitNoteId(null), 200)

    const newInput = [...playerInput, note]
    setPlayerInput(newInput)

    const currentPos = newInput.length - 1
    const expected = sequence[currentPos]

    if (note.id !== expected.id) {
      // Wrong note
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)
      setTimeout(() => {
        setShowEncouragement(false)
        setMood('happy')
        // Replay sequence
        setPlayerInput([])
        setTimeout(playSequence, 400)
      }, 1600)
      return
    }

    // Correct so far
    if (newInput.length === sequence.length) {
      // Full sequence correct!
      setMood('excited')
      playCorrect()
      const earned = MELODY_SPARKS_PER_ROUND
      const newTotal = sparksEarned + earned
      setSparksEarned(newTotal)
      setShowCelebration(true)

      setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        advanceRound(newTotal)
      }, 1400)
    }
  }

  const advanceRound = (currentSparks: number) => {
    const nextIdx = roundIdx + 1
    if (nextIdx >= totalRounds) {
      const finalSparks = currentSparks + MELODY_SPARKS_BONUS
      completeGame('music', 'melody-sequence', 100)
      setTimeout(() => {
        playSpark()
        onComplete(finalSparks)
      }, 300)
    } else {
      setRoundIdx(nextIdx)
      setPhase('watching')
      setPlayerInput([])
      setLitNoteId(null)
      setMood('happy')
    }
  }

  // Progress dots: colour = matched so far
  const progressDots = sequence.map((note, i) => {
    if (i < playerInput.length) return playerInput[i].id === note.id ? 'correct' : 'wrong'
    return 'empty'
  })

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0D1A2E 0%, #0D0B1A 100%)' }}
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
          🎶 {isRTL ? 'חזרי על הנגינה' : 'Melody Sequence'}
        </h1>
        <SparkCounter />
      </div>

      {/* Round progress */}
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

      <div className="flex-1 flex flex-col items-center justify-between py-3 px-4 gap-3">
        <CelebrationOverlay
          show={showCelebration}
          message={isRTL ? 'מצוין! ניגנת נכון! 🎵' : 'Perfect melody! 🎵'}
          sparksEarned={MELODY_SPARKS_PER_ROUND}
        />
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'כמעט! בואי נשמע שוב!' : 'Not quite! Let\'s listen again!'}
        />

        {/* Status label */}
        <motion.div
          className="text-center"
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p
            className="text-xl font-bold"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              color: phase === 'watching' ? '#06B6D4' : '#EC4899',
            }}
          >
            {phase === 'watching'
              ? (isRTL ? '👀 תצפי!' : '👀 Watch!')
              : (isRTL ? '🎵 תורך!' : '🎵 Your turn!')}
          </p>
          <p className="text-white/40 text-sm mt-0.5" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
            {isRTL
              ? `סיבוב ${roundIdx + 1} מתוך ${totalRounds} · ${sequence.length} תווים`
              : `Round ${roundIdx + 1} of ${totalRounds} · ${sequence.length} notes`}
          </p>
        </motion.div>

        {/* Sequence progress dots */}
        <div className="flex gap-3 justify-center">
          {progressDots.map((state, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: 18, height: 18,
                background: state === 'correct'
                  ? '#10B981'
                  : state === 'wrong'
                  ? '#EF4444'
                  : 'rgba(255,255,255,0.15)',
                boxShadow: state === 'correct' ? '0 0 10px rgba(16,185,129,0.6)' : 'none',
              }}
              animate={state === 'correct' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>

        {/* Note buttons */}
        <div className="flex flex-wrap gap-3 justify-center max-w-sm">
          <AnimatePresence>
            {notePool.map((note, i) => {
              const isLit = litNoteId === note.id
              return (
                <motion.button
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{
                    opacity: 1,
                    scale: isLit ? 1.18 : 1,
                    boxShadow: isLit
                      ? `0 0 40px ${note.colorHex}cc`
                      : `0 0 12px ${note.colorHex}44`,
                  }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{
                    opacity: { delay: i * 0.06 },
                    scale: { duration: 0.12 },
                    boxShadow: { duration: 0.12 },
                  }}
                  className="rounded-2xl font-bold text-white border-2"
                  style={{
                    width: age === 3 ? 88 : 76,
                    height: age === 3 ? 88 : 76,
                    background: isLit
                      ? note.colorHex
                      : `${note.colorHex}55`,
                    borderColor: note.colorHex,
                    fontSize: age === 3 ? 24 : 20,
                    fontFamily: 'Fredoka One, Nunito, sans-serif',
                  }}
                  whileTap={phase === 'playing' ? { scale: 0.9 } : {}}
                  onClick={() => handleNotePress(note)}
                  disabled={phase !== 'playing'}
                >
                  {note.label}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Hear again button */}
        {phase === 'playing' && (
          <motion.button
            className="rounded-full px-6 py-2 text-white/70 border border-white/20 text-sm font-bold"
            style={{
              fontFamily: 'Nunito, Heebo, sans-serif',
              background: 'rgba(255,255,255,0.07)',
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setPlayerInput([])
              playSequence()
            }}
          >
            🔁 {isRTL ? 'שמעי שוב' : 'Hear again'}
          </motion.button>
        )}

        {/* Character */}
        <Character mood={mood} size={90} hairColor={hairColor} outfitColor={outfitColor} />
      </div>
    </div>
  )
}
