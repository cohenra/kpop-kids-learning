import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import {
  getComparisonItems,
  pickRandom,
  heNum,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type ComparisonItem,
  type CompareResult,
} from '../../../data/math'

// ─── Game 2: Comparison Game ──────────────────────────────────────────────────
//
// Show two groups side by side. Child picks which side has more (or equal).
// Buttons: ← (left side) / = (equal) / → (right side)
// Age 3: groups up to 5, 3 buttons
// Age 5: groups up to 15, plus follow-up "how many more?"

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'
type Phase = 'compare' | 'howMany' // age 5 two-step

// 'more' = side A (left) has more; 'less' = side B (right) has more; 'equal' = same
// Button order: Left → Equal → Right (always visual left-to-right regardless of RTL)
const COMPARE_BUTTONS: { result: CompareResult; labelHe: string; labelEn: string; arrow: string }[] = [
  { result: 'more',  labelHe: 'ימין', labelEn: 'Left',  arrow: '←' },
  { result: 'equal', labelHe: 'שווה', labelEn: 'Equal', arrow: '=' },
  { result: 'less',  labelHe: 'שמאל', labelEn: 'Right', arrow: '→' },
]

export function ComparisonGame({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const [rounds] = useState<ComparisonItem[]>(() =>
    pickRandom(getComparisonItems(age), ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedResult, setSelectedResult] = useState<CompareResult | null>(null)
  const [phase, setPhase] = useState<Phase>('compare')
  const [howManyInput, setHowManyInput] = useState<number | null>(null)
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
    setSelectedResult(null)
    setPhase('compare')
    setHowManyInput(null)
    setMood('idle')

    const tts = language === 'he' ? current.ttsHe : current.ttsEn
    const timer = setTimeout(() => say(tts), 400)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, language, say])

  const advanceRound = (earned: number) => {
    const newTotal = totalSparks + earned
    setTotalSparks(newTotal)
    setMood('excited')
    playCorrect()

    const msgs = isRTL
      ? ['נכון! 🌟', 'כל הכבוד! ⭐', 'מדהים! 💫', 'יפה! ✨']
      : ['Correct! 🌟', 'Great job! ⭐', 'Amazing! 💫', 'Perfect! ✨']
    setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowCelebration(true)

    autoAdvanceTimer.current = setTimeout(() => {
      setShowCelebration(false)
      playSpark()
      if (roundIdx + 1 >= ROUNDS_PER_GAME) {
        completeGame('math', 'comparison', 100)
        setTotalSparks((prev) => prev + SPARKS_COMPLETION_BONUS)
        setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
      } else {
        setRoundIdx((r) => r + 1)
      }
    }, 1500)
  }

  const handleCompare = (result: CompareResult) => {
    if (answerState !== 'idle') return
    setSelectedResult(result)

    if (result === current.result) {
      setAnswerState('correct')

      // Age 5 with non-equal result: ask follow-up "how many more/fewer?"
      if (age === 5 && result !== 'equal' && current.difference > 0) {
        playCorrect()
        setTimeout(() => {
          setAnswerState('idle')
          setPhase('howMany')
          const tts = isRTL
            ? `כמה ${result === 'more' ? 'יותר' : 'פחות'}?`
            : `How many ${result === 'more' ? 'more' : 'fewer'}?`
          say(tts)
        }, 600)
      } else {
        advanceRound(SPARKS_PER_ROUND)
      }
    } else {
      setAnswerState('wrong')
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowEncouragement(false)
        setAnswerState('idle')
        setSelectedResult(null)
        setMood('idle')
        const tts = language === 'he' ? current.ttsHe : current.ttsEn
        say(tts)
      }, 1600)
    }
  }

  const handleHowMany = (num: number) => {
    if (answerState !== 'idle') return
    setHowManyInput(num)

    if (num === current.difference) {
      setAnswerState('correct')
      advanceRound(SPARKS_PER_ROUND)
    } else {
      setAnswerState('wrong')
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowEncouragement(false)
        setAnswerState('idle')
        setHowManyInput(null)
        setMood('idle')
        const tts = isRTL ? 'כמה יותר?' : 'How many more?'
        say(tts)
      }, 1600)
    }
  }

  // Generate "how many more?" choices
  const howManyChoices = (() => {
    if (!current) return []
    const correct = current.difference
    const opts = new Set<number>([correct])
    while (opts.size < 4) {
      const v = Math.max(1, correct + (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1))
      if (v !== correct) opts.add(v)
    }
    // Simple shuffle
    return [...opts].sort(() => Math.random() - 0.5)
  })()

  const renderGroup = (emoji: string, count: number, side: 'A' | 'B') => (
    <motion.div
      className="flex flex-col items-center gap-2 flex-1"
      initial={{ opacity: 0, x: side === 'A' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <div
        className="rounded-2xl border border-white/10 p-3 flex flex-wrap justify-center gap-1"
        style={{
          background: side === 'A'
            ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(45,42,74,0.8))'
            : 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(45,42,74,0.8))',
          minHeight: 80,
          minWidth: 110,
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.span
            key={i}
            style={{ fontSize: count > 10 ? 18 : 24 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 400 }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>
      {/* Count label (age 5) */}
      {age === 5 && answerState === 'correct' && (
        <motion.span
          className="text-white/60 font-bold text-lg"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {language === 'he' ? heNum(count) : count}
        </motion.span>
      )}
    </motion.div>
  )

  if (!current) return null

  return (
    <GameShell
      title={isRTL ? 'השוואה' : 'Comparison'}
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
          message={isRTL ? 'נסי שוב! ספרי את שני הצדדים' : 'Try again! Count both sides'}
        />

        {/* ── Two groups ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Question */}
            <motion.button
              className="text-white/70 text-lg text-center px-4 py-2 rounded-2xl
                         bg-kpop-card/60 border border-white/10"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif', minHeight: 44 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const tts = phase === 'compare'
                  ? (language === 'he' ? current.ttsHe : current.ttsEn)
                  : (isRTL ? 'כמה יותר?' : 'How many more?')
                say(tts)
              }}
            >
              🔊 {phase === 'compare'
                ? (language === 'he' ? current.ttsHe : current.ttsEn)
                : (isRTL ? 'כמה יותר?' : 'How many more?')}
            </motion.button>

            {/* Side A vs Side B */}
            <div className="flex items-center gap-3 w-full">
              {renderGroup(current.emojiA, current.countA, 'A')}

              <div className="flex flex-col items-center gap-1">
                <span className="text-white/30 text-3xl font-bold">VS</span>
              </div>

              {renderGroup(current.emojiB, current.countB, 'B')}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Phase: Compare ────────────────────────────────────────── */}
        {phase === 'compare' && (
          <div className="grid grid-cols-3 gap-2 w-full">
            {COMPARE_BUTTONS.map((btn, i) => {
              const st =
                answerState === 'idle' ? 'default'
                : btn.result === current.result ? 'correct'
                : btn.result === selectedResult ? 'wrong'
                : 'disabled'

              return (
                <motion.button
                  key={btn.result}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, type: 'spring', stiffness: 300 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handleCompare(btn.result)}
                  disabled={answerState !== 'idle'}
                  className="rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 py-2"
                  style={{
                    minHeight: age === 3 ? 80 : 72,
                    fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                    borderColor:
                      st === 'correct' ? '#F59E0B'
                      : st === 'wrong' ? 'rgba(239,68,68,0.7)'
                      : st === 'disabled' ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.25)',
                    background:
                      st === 'correct' ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(236,72,153,0.2))'
                      : st === 'wrong' ? 'rgba(239,68,68,0.15)'
                      : st === 'disabled' ? 'rgba(45,42,74,0.4)'
                      : 'rgba(45,42,74,0.7)',
                    opacity: st === 'disabled' ? 0.5 : 1,
                  }}
                >
                  {/* Large arrow / equals symbol */}
                  <span
                    className="font-bold leading-none"
                    style={{
                      fontSize: btn.result === 'equal' ? 28 : 32,
                      color: st === 'correct' ? '#F59E0B' : st === 'disabled' ? 'rgba(255,255,255,0.3)' : 'white',
                      fontFamily: 'Fredoka One, sans-serif',
                      direction: 'ltr',
                    }}
                  >
                    {btn.arrow}
                  </span>
                  {/* Label below */}
                  <span
                    className="font-bold text-xs"
                    style={{ color: st === 'correct' ? '#F59E0B' : st === 'disabled' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)' }}
                  >
                    {language === 'he' ? btn.labelHe : btn.labelEn}
                  </span>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* ── Phase: How many more? (Age 5) ─────────────────────────── */}
        {phase === 'howMany' && (
          <div className="flex flex-col items-center gap-3 w-full">
            <motion.p
              className="text-white/70 text-lg text-center"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isRTL ? 'כמה יותר?' : 'How many more?'}
            </motion.p>
            <div className="grid grid-cols-2 gap-3 w-full">
              {howManyChoices.map((num, i) => {
                const st =
                  answerState === 'idle' ? 'default'
                  : num === current.difference ? 'correct'
                  : num === howManyInput ? 'wrong'
                  : 'disabled'
                return (
                  <motion.button
                    key={num}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleHowMany(num)}
                    disabled={answerState !== 'idle'}
                    className="rounded-2xl border-2 py-4 font-bold text-2xl"
                    style={{
                      fontFamily: 'Fredoka One, Nunito, sans-serif',
                      minHeight: 72,
                      borderColor:
                        st === 'correct' ? '#F59E0B'
                        : st === 'wrong' ? 'rgba(239,68,68,0.7)'
                        : 'rgba(255,255,255,0.2)',
                      background:
                        st === 'correct' ? 'rgba(245,158,11,0.2)'
                        : st === 'wrong' ? 'rgba(239,68,68,0.1)'
                        : 'rgba(45,42,74,0.7)',
                      color: st === 'correct' ? '#F59E0B' : 'white',
                      opacity: st === 'disabled' ? 0.5 : 1,
                    }}
                  >
                    {language === 'he' ? heNum(num) : num}
                  </motion.button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </GameShell>
  )
}
