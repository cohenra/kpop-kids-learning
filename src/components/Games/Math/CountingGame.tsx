import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import { AnswerButton } from '../AnswerButton'
import {
  getCountingItems,
  getCountingChoices,
  pickRandom,
  heNum,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type CountingItem,
} from '../../../data/math'

// ─── Game 1: Counting Game ─────────────────────────────────────────────────────
//
// Age 3: count stars up to 10, 2 answer choices
// Age 5: count up to 30 in rows, 4 choices

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

const ROW_SIZE = 5 // Group objects into rows of 5 for age 5

export function CountingGame({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const choiceCount = age === 3 ? 2 : 4
  const [rounds] = useState<CountingItem[]>(() =>
    pickRandom(getCountingItems(language, age), ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [choices, setChoices] = useState<number[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = rounds[roundIdx]

  useEffect(() => {
    if (!current) return
    setAnswerState('idle')
    setSelectedAnswer(null)
    setMood('idle')

    const newChoices = getCountingChoices(current.count, age, choiceCount)
    setChoices(newChoices)

    const tts = language === 'he' ? current.ttsHe : current.ttsEn
    const timer = setTimeout(() => say(tts), 400)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, age, choiceCount, language, say])

  const handleChoice = (answer: number) => {
    if (answerState !== 'idle') return
    setSelectedAnswer(answer)

    if (answer === current.count) {
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['נכון! 🌟', 'כל הכבוד! ⭐', 'מדהים! 💫', 'יפה ספרת! ✨']
        : ['Correct! 🌟', 'Amazing! ⭐', 'Great counting! 💫', 'Fantastic! ✨']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      const countWord = language === 'he'
        ? `${heNum(current.count)}!`
        : `${current.count}!`
      setTimeout(() => say(countWord), 400)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          completeGame('math', 'counting', 100)
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
        setSelectedAnswer(null)
        setMood('idle')
        const tts = language === 'he' ? current.ttsHe : current.ttsEn
        say(tts)
      }, 1600)
    }
  }

  // Render objects in a grid (rows of ROW_SIZE for age 5)
  const renderObjects = () => {
    const objs = Array.from({ length: current.count })
    const useRows = age === 5 && current.count > ROW_SIZE

    if (useRows) {
      const rows: number[][] = []
      for (let i = 0; i < objs.length; i += ROW_SIZE) {
        rows.push(objs.slice(i, i + ROW_SIZE).map((_, j) => i + j))
      }
      return (
        <div className="flex flex-col items-center gap-1">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1 justify-center">
              {row.map((idx) => (
                <motion.span
                  key={idx}
                  style={{ fontSize: current.count > 20 ? 22 : 26 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.025, type: 'spring', stiffness: 400 }}
                >
                  {current.emoji}
                </motion.span>
              ))}
            </div>
          ))}
        </div>
      )
    }

    // Single row / small grid for age 3
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {objs.map((_, idx) => (
          <motion.span
            key={idx}
            style={{ fontSize: age === 3 ? 38 : 30 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: idx * 0.07, type: 'spring', stiffness: 360 }}
          >
            {current.emoji}
          </motion.span>
        ))}
      </div>
    )
  }

  if (!current) return null

  return (
    <GameShell
      title={isRTL ? 'ספירה' : 'Counting'}
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
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'נסי שוב! ספרי בזהירות' : 'Try again! Count carefully'}
        />

        {/* ── Objects display ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.emoji + current.count}
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* Question */}
            <motion.button
              className="text-white/70 text-xl text-center px-4 py-2 rounded-2xl
                         bg-kpop-card/60 border border-white/10"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif', minHeight: 48 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => say(language === 'he' ? current.ttsHe : current.ttsEn)}
            >
              🔊 {language === 'he' ? current.ttsHe : current.ttsEn}
            </motion.button>

            {/* Objects grid */}
            <div
              className="rounded-3xl border border-kpop-cyan/30 p-4 w-full max-w-xs flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))',
                boxShadow: '0 0 24px rgba(6,182,212,0.2)',
                minHeight: age === 3 ? 160 : 180,
              }}
            >
              {renderObjects()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Instruction ────────────────────────────────────────────── */}
        <motion.p
          className="text-white/70 text-lg text-center"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isRTL ? 'ספרי וגעי במספר הנכון!' : 'Count and tap the right number!'}
        </motion.p>

        {/* ── Answer choices ──────────────────────────────────────────── */}
        <div className={`grid gap-3 w-full ${choiceCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {choices.map((num, i) => {
            const st =
              answerState === 'idle' ? 'default'
              : num === current.count ? 'correct'
              : num === selectedAnswer ? 'wrong'
              : 'disabled'

            return (
              <AnswerButton
                key={num}
                label={String(num)}
                sublabel={language === 'he' ? heNum(num) : undefined}
                onClick={() => handleChoice(num)}
                state={st}
                age={age}
                index={i}
              />
            )
          })}
        </div>
      </div>
    </GameShell>
  )
}
