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
  getPatternItems,
  getPatternChoices,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type PatternItem,
} from '../../../data/math'

// ─── Game 4: Pattern Game ─────────────────────────────────────────────────────
//
// Show a K-POP emoji sequence with blank(s) at the end.
// Age 3: AB patterns, 1 blank, 2 choices
// Age 5: AB/ABC/AABB patterns, up to 2 blanks, 4 choices (solves one blank at a time)

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function PatternGame({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const choiceCount = age === 3 ? 2 : 4
  const [rounds] = useState<PatternItem[]>(() => getPatternItems(age).slice(0, ROUNDS_PER_GAME))
  const [roundIdx, setRoundIdx] = useState(0)
  const [choices, setChoices] = useState<string[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  // Track which blanks have been filled (for multi-blank rounds)
  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({})
  const [currentBlankStep, setCurrentBlankStep] = useState(0) // index into blankIndices
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
    setFilledBlanks({})
    setCurrentBlankStep(0)
    setMood('idle')

    const newChoices = getPatternChoices(current.answers, choiceCount)
    setChoices(newChoices)

    const tts = language === 'he' ? current.ttsHe : current.ttsEn
    const timer = setTimeout(() => say(tts), 400)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, choiceCount, language, say])

  const advanceRound = (earned: number) => {
    const newTotal = totalSparks + earned
    setTotalSparks(newTotal)
    setMood('excited')

    const msgs = isRTL
      ? ['נכון! 🌟', 'כל הכבוד! ⭐', 'מדהים! 💫', 'יפה! ✨']
      : ['Correct! 🌟', 'Amazing! ⭐', 'Great pattern! 💫', 'Perfect! ✨']
    setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowCelebration(true)

    autoAdvanceTimer.current = setTimeout(() => {
      setShowCelebration(false)
      playSpark()
      if (roundIdx + 1 >= ROUNDS_PER_GAME) {
        completeGame('math', 'patterns', 100)
        setTotalSparks((prev) => prev + SPARKS_COMPLETION_BONUS)
        setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
      } else {
        setRoundIdx((r) => r + 1)
      }
    }, 1500)
  }

  const handleChoice = (emoji: string) => {
    if (answerState !== 'idle') return
    setSelectedAnswer(emoji)

    const correctAnswer = current.answers[currentBlankStep]

    if (emoji === correctAnswer) {
      playCorrect()
      const newFilled = { ...filledBlanks, [current.blankIndices[currentBlankStep]]: emoji }
      setFilledBlanks(newFilled)

      // More blanks to fill?
      if (currentBlankStep + 1 < current.blankIndices.length) {
        // Move to next blank
        setTimeout(() => {
          setCurrentBlankStep((s) => s + 1)
          setSelectedAnswer(null)
          setAnswerState('idle')
          // Update choices for next blank
          const nextChoices = getPatternChoices(
            current.answers.slice(currentBlankStep + 1),
            choiceCount,
          )
          setChoices(nextChoices)
        }, 400)
      } else {
        // All blanks filled — complete round
        setAnswerState('correct')
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
        setSelectedAnswer(null)
        setMood('idle')
        const tts = language === 'he' ? current.ttsHe : current.ttsEn
        say(tts)
      }, 1600)
    }
  }

  if (!current) return null

  // Build the display sequence with filled + unfilled blanks
  const displaySequence = current.sequence.map((emoji, i) => {
    if (current.blankIndices.includes(i)) {
      return filledBlanks[i] ?? ''
    }
    return emoji
  })

  // Which blank position are we on?
  const activeBlankPos = current.blankIndices[currentBlankStep]

  return (
    <GameShell
      title={isRTL ? 'תבניות' : 'Patterns'}
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
          message={isRTL ? 'נסי שוב! הסתכלי על התבנית' : 'Try again! Look at the pattern'}
        />

        {/* ── Sequence display ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* TTS question */}
            <motion.button
              className="text-white/70 text-base text-center px-4 py-2 rounded-2xl
                         bg-kpop-card/60 border border-white/10"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif', minHeight: 44 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => say(language === 'he' ? current.ttsHe : current.ttsEn)}
            >
              🔊 {language === 'he' ? current.ttsHe : current.ttsEn}
            </motion.button>

            {/* Pattern sequence */}
            <div
              className="rounded-3xl border border-white/10 p-4 w-full flex items-center justify-center gap-2 flex-wrap"
              style={{
                background: 'linear-gradient(135deg, rgba(45,42,74,0.9), rgba(30,27,46,0.9))',
                boxShadow: '0 0 20px rgba(124,58,237,0.15)',
                minHeight: 100,
              }}
            >
              {displaySequence.map((em, i) => {
                const isBlank = current.blankIndices.includes(i)
                const isActiveBlank = i === activeBlankPos && answerState !== 'correct'
                const isFilled = isBlank && filledBlanks[i] !== undefined

                return (
                  <motion.div
                    key={i}
                    className={[
                      'flex items-center justify-center rounded-xl border-2',
                      isActiveBlank
                        ? 'border-kpop-pink/70 bg-kpop-pink/10'
                        : isFilled
                        ? 'border-kpop-gold/60 bg-kpop-gold/10'
                        : isBlank
                        ? 'border-white/20 bg-white/5'
                        : 'border-transparent',
                    ].join(' ')}
                    style={{ width: 52, height: 52, fontSize: 30 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      ...(isActiveBlank ? { y: [0, -4, 0] } : {}),
                    }}
                    transition={{
                      delay: i * 0.04,
                      ...(isActiveBlank ? { duration: 1, repeat: Infinity } : {}),
                    }}
                  >
                    {em || (isActiveBlank ? '?' : '…')}
                  </motion.div>
                )
              })}
            </div>

            {/* Pattern type label */}
            <p
              className="text-white/40 text-sm"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
            >
              {isRTL ? 'תבנית:' : 'Pattern:'}{' '}
              <span className="text-kpop-cyan">{current.patternType}</span>
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Instruction ────────────────────────────────────────────── */}
        <motion.p
          className="text-white/70 text-lg text-center"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isRTL ? 'מה הולך הלאה?' : 'What comes next?'}
        </motion.p>

        {/* ── Answer choices ──────────────────────────────────────────── */}
        <div className={`grid gap-3 w-full ${choiceCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {choices.map((em, i) => {
            const correctAnswer = current.answers[currentBlankStep]
            const st =
              answerState === 'idle' ? 'default'
              : em === correctAnswer ? 'correct'
              : em === selectedAnswer ? 'wrong'
              : 'disabled'

            return (
              <AnswerButton
                key={em + i}
                emoji={em}
                label={em}
                onClick={() => handleChoice(em)}
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
