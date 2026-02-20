import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import { Character } from '../../Character/Character'
import { SparkCounter } from '../../UI/SparkCounter'
import { t } from '../../../i18n/strings'
import { RHYTHM_CONFIGS, getBeatIntervalMs, SPARKS_PER_ROUND } from '../../../data/music'

// ─── Game 1: Rhythm Tap ───────────────────────────────────────────────────────
//
// A large circle pulses with the beat. Child taps in time.
// Age 3: 60 BPM, 4 beats, ±400 ms tolerance
// Age 5: 90 BPM, 8 beats, ±250 ms tolerance
// 3 rounds total per session.

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type Phase = 'ready' | 'countdown' | 'playing' | 'result'

// Synthesise a metronome tick
function playTick(loud = false) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = loud ? 880 : 660
    osc.type = 'sine'
    gain.gain.setValueAtTime(loud ? 0.35 : 0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch { /* silent */ }
}

export function RhythmTap({ onComplete, onBack }: Props) {
  const { language, isRTL, age, activeProfile } = useApp()
  const { say, playCorrect, playSpark } = useAudio()
  const { completeGame } = useProgress()
  const s = t(language)

  const config = RHYTHM_CONFIGS[age]
  const intervalMs = getBeatIntervalMs(config.bpm)

  const TOTAL_ROUNDS = 3
  const [roundIdx, setRoundIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [beatIdx, setBeatIdx] = useState(0)          // which beat we're on
  const [pulsing, setPulsing] = useState(false)       // circle pulse trigger
  const [taps, setTaps] = useState<number[]>([])      // timestamps of taps
  const [beatTimes, setBeatTimes] = useState<number[]>([])  // scheduled beat timestamps
  const [hitCount, setHitCount] = useState(0)
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle')
  const [countdown, setCountdown] = useState(3)

  const beatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const beatTimesRef = useRef<number[]>([])
  const tapsRef = useRef<number[]>([])

  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899'

  // ── Start a round ─────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setPhase('countdown')
    setCountdown(3)
    setTaps([])
    setBeatTimes([])
    setBeatIdx(0)
    tapsRef.current = []
    beatTimesRef.current = []

    const tts = isRTL
      ? 'תקישי על הכפתור בזמן הנכון!'
      : 'Tap the circle to the beat!'
    say(tts)

    let c = 3
    countdownTimerRef.current = setInterval(() => {
      c--
      setCountdown(c)
      playTick(true)
      if (c <= 0) {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        startBeats()
      }
    }, 1000)
  }, [isRTL, say])

  const startBeats = () => {
    setPhase('playing')
    startTimeRef.current = Date.now()
    scheduleBeat(0)
  }

  const scheduleBeat = (idx: number) => {
    if (idx >= config.beats) {
      // All beats played — evaluate after short delay
      setTimeout(evaluateRound, 500)
      return
    }
    const delay = idx === 0 ? 0 : intervalMs
    beatTimerRef.current = setTimeout(() => {
      const now = Date.now()
      setBeatIdx(idx)
      setPulsing(true)
      playTick(false)
      beatTimesRef.current = [...beatTimesRef.current, now]
      setBeatTimes((prev) => [...prev, now])

      setTimeout(() => setPulsing(false), 200)
      scheduleBeat(idx + 1)
    }, delay)
  }

  const evaluateRound = () => {
    const beats = beatTimesRef.current
    const tapsLocal = tapsRef.current

    let hits = 0
    for (const beatTime of beats) {
      const closest = tapsLocal.reduce(
        (best, tap) =>
          Math.abs(tap - beatTime) < Math.abs(best - beatTime) ? tap : best,
        Infinity
      )
      if (Math.abs(closest - beatTime) <= config.toleranceMs) hits++
    }

    setHitCount(hits)
    const success = hits >= Math.ceil(config.beats * 0.6) // 60% hit rate = pass

    if (success) {
      setMood('excited')
      playCorrect()
      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? [`${hits} מתוך ${config.beats} בזמן! 🌟`, 'מעולה! 🎵', 'כל הכבוד! 💫']
        : [`${hits} of ${config.beats} on time! 🌟`, 'Excellent! 🎵', 'Bravo! 💫']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        if (roundIdx + 1 >= TOTAL_ROUNDS) {
          completeGame('music', 'rhythm-tap', 100)
          setTimeout(() => onComplete(newTotal), 500)
        } else {
          setRoundIdx((r) => r + 1)
          setPhase('ready')
        }
      }, 1600)
    } else {
      setMood('encouraging')
      setShowEncouragement(true)
      setTimeout(() => {
        setShowEncouragement(false)
        setMood('idle')
        setPhase('ready')
      }, 1800)
    }
    setPhase('result')
  }

  const handleTap = () => {
    if (phase !== 'playing') return
    const now = Date.now()
    tapsRef.current = [...tapsRef.current, now]
    setTaps((prev) => [...prev, now])
  }

  useEffect(() => {
    return () => {
      if (beatTimerRef.current) clearTimeout(beatTimerRef.current)
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    }
  }, [])

  // Suppress unused vars
  void taps
  void beatTimes

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #0D0B1A 100%)' }}
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
          🎵 {isRTL ? 'הקשבה לקצב' : 'Rhythm Tap'}
        </h1>
        <SparkCounter />
      </div>

      {/* Round indicators */}
      <div className="flex justify-center gap-3 pt-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              background: i < roundIdx ? '#F59E0B' : i === roundIdx ? '#EC4899' : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-8">
        <CelebrationOverlay show={showCelebration} message={celebMessage} sparksEarned={SPARKS_PER_ROUND} />
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'נסי שוב! תקישי בזמן הנבחן!' : 'Try again! Tap with the beat!'}
        />

        {/* Beat display */}
        <div className="flex gap-2 justify-center">
          {Array.from({ length: config.beats }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: 14, height: 14,
                background: i < beatIdx
                  ? '#F59E0B'
                  : i === beatIdx && phase === 'playing'
                  ? '#EC4899'
                  : 'rgba(255,255,255,0.15)',
              }}
              animate={i === beatIdx && pulsing ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {/* Big tap circle */}
        <AnimatePresence>
          {phase !== 'result' && (
            <motion.button
              key="tap-circle"
              className="relative rounded-full flex items-center justify-center"
              style={{
                width: age === 3 ? 220 : 200,
                height: age === 3 ? 220 : 200,
                background: phase === 'playing'
                  ? 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(124,58,237,0.15) 70%)'
                  : 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                border: '3px solid',
                borderColor: phase === 'playing' ? '#EC4899' : 'rgba(255,255,255,0.2)',
                boxShadow: pulsing
                  ? '0 0 60px rgba(236,72,153,0.7)'
                  : phase === 'playing'
                  ? '0 0 30px rgba(236,72,153,0.3)'
                  : '0 0 10px rgba(255,255,255,0.05)',
              }}
              animate={pulsing ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 0.18 }}
              whileTap={phase === 'playing' ? { scale: 0.92 } : {}}
              onClick={handleTap}
              disabled={phase !== 'playing'}
            >
              <span style={{ fontSize: 64 }}>
                {phase === 'ready' ? '🎵' : phase === 'countdown' ? countdown : phase === 'playing' ? '👆' : '✨'}
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Result */}
        {phase === 'result' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-6xl font-bold" style={{ fontFamily: 'Fredoka One, sans-serif', color: '#F59E0B' }}>
              {hitCount}/{config.beats}
            </p>
            <p className="text-white/60 text-xl mt-2" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL ? 'פגיעות בזמן' : 'beats on time'}
            </p>
          </motion.div>
        )}

        {/* Character */}
        <Character mood={mood} size={100} hairColor={hairColor} outfitColor={outfitColor} />

        {/* Start / instruction */}
        {phase === 'ready' && (
          <motion.button
            className="rounded-3xl px-10 py-4 font-bold text-white text-2xl border-2 border-kpop-pink/50"
            style={{
              background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
              boxShadow: '0 0 30px rgba(236,72,153,0.4)',
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              minHeight: age === 3 ? 80 : 70,
              minWidth: 200,
            }}
            whileTap={{ scale: 0.93 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={startCountdown}
          >
            {isRTL ? 'התחילי! 🎵' : 'Start! 🎵'}
          </motion.button>
        )}

        {phase === 'playing' && (
          <motion.p
            className="text-kpop-pink text-xl font-bold text-center"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            animate={{ scale: pulsing ? 1.2 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {isRTL ? 'תקישי! 🎵' : 'Tap! 🎵'}
          </motion.p>
        )}
      </div>
    </div>
  )
}
