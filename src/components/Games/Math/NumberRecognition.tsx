import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import {
  getNumRecItems,
  pickRandom,
  heNum,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type NumRecognitionItem,
} from '../../../data/math'

// ─── Game 5: Number Recognition ───────────────────────────────────────────────
//
// Show a large styled number. Child taps the group of objects with the same count.
// Age 3: range 1–5, 2 group choices
// Age 5: range 1–20, 4 group choices

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function NumberRecognition({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const [rounds] = useState<NumRecognitionItem[]>(() =>
    pickRandom(getNumRecItems(age), ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number | null>(null)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = rounds[roundIdx]

  const speakTarget = () => {
    const text = language === 'he' ? current.ttsHe : current.ttsEn
    say(text)
  }

  useEffect(() => {
    if (!current) return
    setAnswerState('idle')
    setSelectedGroupIdx(null)
    setMood('idle')

    const timer = setTimeout(() => speakTarget(), 500)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx, current])

  const handleGroupTap = (groupIdx: number) => {
    if (answerState !== 'idle') return
    setSelectedGroupIdx(groupIdx)

    if (groupIdx === current.correctGroupIdx) {
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['נכון! 🌟', 'כל הכבוד! ⭐', 'מדהים! 💫', 'יפה ספרת! ✨']
        : ['Correct! 🌟', 'Well counted! ⭐', 'Amazing! 💫', 'Fantastic! ✨']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      const praise = language === 'he'
        ? `${heNum(current.target)}! נכון!`
        : `${current.target}! Correct!`
      setTimeout(() => say(praise), 400)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          completeGame('math', 'number-recognition', 100)
          setTotalSparks((prev) => prev + SPARKS_COMPLETION_BONUS)
          setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
        } else {
          setRoundIdx((r) => r + 1)
        }
      }, 1500)
    } else {
      setAnswerState('wrong')
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowEncouragement(false)
        setAnswerState('idle')
        setSelectedGroupIdx(null)
        setMood('idle')
        speakTarget()
      }, 1600)
    }
  }

  if (!current) return null

  const cols = current.groups.length === 2 ? 'grid-cols-2' : 'grid-cols-2'

  return (
    <GameShell
      title={isRTL ? 'זיהוי מספרים' : 'Number Recognition'}
      round={roundIdx + 1}
      totalRounds={ROUNDS_PER_GAME}
      mood={mood}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-4 pt-1 relative gap-3">
        <CelebrationOverlay
          show={showCelebration}
          message={celebMessage}
          sparksEarned={SPARKS_PER_ROUND}
        />
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'נסי שוב! ספרי בזהירות' : 'Try again! Count carefully'}
        />

        {/* ── Big number display ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            {/* Instruction */}
            <p
              className="text-white/60 text-base text-center"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
            >
              {isRTL ? 'מצאי את הקבוצה עם כמות זהה:' : 'Find the group with the same amount:'}
            </p>

            {/* The number — large, glowing, tappable to replay TTS */}
            <motion.button
              className="relative flex items-center justify-center rounded-3xl border-2 border-kpop-cyan/50"
              style={{
                width: 130,
                height: 130,
                background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(124,58,237,0.2))',
                boxShadow: '0 0 40px rgba(6,182,212,0.35)',
              }}
              whileTap={{ scale: 0.92 }}
              onClick={speakTarget}
              animate={{ boxShadow: ['0 0 30px rgba(6,182,212,0.3)', '0 0 50px rgba(124,58,237,0.4)', '0 0 30px rgba(6,182,212,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <span
                className="font-bold leading-none"
                style={{
                  fontSize: current.target >= 10 ? 64 : 78,
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                  background: 'linear-gradient(135deg, #06B6D4, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  direction: 'ltr',
                }}
              >
                {current.target}
              </span>
              {/* "Tap to hear" hint */}
              <span className="absolute bottom-1.5 text-white/30 text-xs">🔊</span>
            </motion.button>

            {/* Hebrew word below number (age 5) */}
            {age === 5 && language === 'he' && (
              <motion.span
                className="text-white/50 text-xl font-bold"
                style={{ fontFamily: 'Heebo, Assistant, sans-serif' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {heNum(current.target)}
              </motion.span>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Object groups grid ────────────────────────────────────── */}
        <div className={`grid ${cols} gap-3 w-full`}>
          {current.groups.map((group, gi) => {
            const isCorrect = gi === current.correctGroupIdx
            const isSelected = gi === selectedGroupIdx

            const st =
              answerState === 'idle' ? 'default'
              : isCorrect ? 'correct'
              : isSelected ? 'wrong'
              : 'disabled'

            const borderColor =
              st === 'correct' ? '#F59E0B'
              : st === 'wrong' ? 'rgba(239,68,68,0.7)'
              : st === 'disabled' ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.2)'

            const bg =
              st === 'correct' ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(236,72,153,0.15))'
              : st === 'wrong' ? 'rgba(239,68,68,0.12)'
              : st === 'disabled' ? 'rgba(45,42,74,0.5)'
              : 'rgba(45,42,74,0.8)'

            // Emoji size: age 3 big (max 5), age 5 smaller
            const emojiSize = age === 3 ? 38 : (group.count > 10 ? 18 : 24)

            return (
              <motion.button
                key={gi}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + gi * 0.08, type: 'spring', stiffness: 260 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleGroupTap(gi)}
                disabled={answerState !== 'idle'}
                className="relative rounded-2xl border-2 p-3 flex flex-wrap justify-center gap-1.5 items-center"
                style={{
                  borderColor,
                  background: bg,
                  opacity: st === 'disabled' ? 0.45 : 1,
                  minHeight: age === 3 ? 110 : 90,
                  boxShadow: st === 'correct' ? '0 0 20px rgba(245,158,11,0.35)' : 'none',
                }}
              >
                {/* Object emojis */}
                {Array.from({ length: group.count }).map((_, oi) => (
                  <motion.span
                    key={oi}
                    style={{ fontSize: emojiSize }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: gi * 0.05 + oi * 0.03, type: 'spring', stiffness: 400 }}
                  >
                    {group.emoji}
                  </motion.span>
                ))}

                {/* Correct checkmark badge */}
                {st === 'correct' && (
                  <motion.div
                    className="absolute top-1.5 end-1.5 w-7 h-7 rounded-full
                               flex items-center justify-center text-sm font-bold"
                    style={{ background: '#F59E0B', color: 'white' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
