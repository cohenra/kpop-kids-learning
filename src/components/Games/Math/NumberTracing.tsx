// ─── Game: Number Tracing ─────────────────────────────────────────────────────
//
// Child traces digits 0–9 with their finger.
// Uses the same <LetterTracer> as Finger Writing, so the experience is
// consistent: writing guidelines, animated demo, start dot, direction arrow.
//
// Age 3: digits 0–3 only (4 items, single strokes)
// Age 5: all digits 0–9

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { LetterTracer } from '../LetterTracer'
import { getTracingItems } from '../../../data/tracingData'
import type { TracingItem } from '../../../data/tracingData'
import { shuffle, SPARKS_PER_ROUND, SPARKS_COMPLETION_BONUS } from '../../../data/literacy'

const ROUNDS_PER_GAME = 5

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

export function NumberTracing({ onComplete, onBack }: Props) {
  const { isRTL, age } = useApp()
  const { say, playCorrect, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const [items] = useState<TracingItem[]>(() =>
    shuffle(getTracingItems('number', age)).slice(0, ROUNDS_PER_GAME)
  )

  const [roundIdx,       setRoundIdx]       = useState(0)
  const [totalSparks,    setTotalSparks]    = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebMessage,   setCelebMessage]   = useState('')
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging'>('thinking')

  const current = items[roundIdx]

  // Announce the digit name when round starts
  useEffect(() => {
    if (!current) return
    setMood('thinking')
    const t = setTimeout(() => say(current.ttsName), 400)
    return () => clearTimeout(t)
  }, [roundIdx, current, say])

  const handleSuccess = () => {
    playCorrect()
    setMood('excited')

    const earned   = SPARKS_PER_ROUND
    const newTotal = totalSparks + earned
    setTotalSparks(newTotal)

    const msgs = isRTL
      ? ['כתבת את ה-' + current.displayChar + '! 🌟', 'מדהים! ✨', 'יפה! ⭐', 'מושלם! 🎉']
      : ['You wrote ' + current.displayChar + '! 🌟', 'Amazing! ✨', 'Great job! ⭐', 'Perfect! 🎉']
    setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowCelebration(true)

    setTimeout(() => {
      setShowCelebration(false)
      playSpark()
      if (roundIdx + 1 >= ROUNDS_PER_GAME) {
        completeGame('math', 'number-tracing', 100)
        setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 500)
      } else {
        setRoundIdx(r => r + 1)
        setMood('thinking')
      }
    }, 1600)
  }

  if (!current) return null

  return (
    <GameShell
      title={isRTL ? '✍️ כתיבת מספרים' : '✍️ Number Writing'}
      round={roundIdx + 1}
      totalRounds={ROUNDS_PER_GAME}
      mood={mood}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-4 pt-2 relative">
        <CelebrationOverlay
          show={showCelebration}
          message={celebMessage}
          sparksEarned={SPARKS_PER_ROUND}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="flex flex-col items-center gap-3 w-full"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          >
            {/* Number display + hear button */}
            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 px-3 py-2 rounded-full
                           bg-kpop-card/70 border border-kpop-cyan/30 text-kpop-cyan
                           font-bold text-base"
                style={{ minHeight: 44, fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => say(current.ttsName)}
              >
                🔊
              </motion.button>

              {/* Big digit preview */}
              <motion.span
                className="text-6xl font-bold ltr-number"
                style={{
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                  color: '#F59E0B',
                  textShadow: '0 0 20px rgba(245,158,11,0.5)',
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {current.displayChar}
              </motion.span>
            </div>

            <p className="text-white/45 text-sm text-center"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL
                ? '✍️ עקבי אחרי המספר — התחילי מהנקודה הירוקה'
                : '✍️ Trace the number — start from the green dot'}
            </p>

            {/* The tracer canvas */}
            <LetterTracer
              item={current}
              onSuccess={handleSuccess}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
