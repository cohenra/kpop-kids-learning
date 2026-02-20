import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import { AnswerButton } from '../AnswerButton'
import {
  getWords,
  getLetters,
  getMissingLetter,
  buildWordDisplay,
  getLetterChoices,
  pickRandom,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type WordItem,
} from '../../../data/literacy'
import { t } from '../../../i18n/strings'

// ─── Game 2: Word Completion ──────────────────────────────────────────────────
//
// Show picture + word with one letter missing (_)
// Age 3: 2 letter choices | Age 5: 4 choices, missing letter anywhere
// TTS reads the word on image appear

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function WordCompletion({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()
  const s = t(language)

  const choiceCount = age === 3 ? 2 : 4
  const allWords = getWords(language)
  const allLetters = getLetters(language)

  // Precompute 10 rounds
  const [rounds] = useState<WordItem[]>(() => pickRandom(allWords, ROUNDS_PER_GAME))
  const [roundIdx, setRoundIdx] = useState(0)
  const [letterChoices, setLetterChoices] = useState<string[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = rounds[roundIdx]

  const buildLetterChoices = useCallback((word: WordItem) => {
    const missing = getMissingLetter(word)
    const choices = getLetterChoices(missing, allLetters, choiceCount)
    setLetterChoices(choices)
  }, [allLetters, choiceCount])

  useEffect(() => {
    if (!current) return
    setAnswerState('idle')
    setSelectedLetter(null)
    setMood('idle')
    buildLetterChoices(current)
    const timer = setTimeout(() => say(current.ttsWord), 400)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, buildLetterChoices, say])

  const handleChoice = (letter: string) => {
    if (answerState !== 'idle') return
    setSelectedLetter(letter)
    const correct = getMissingLetter(current)

    if (letter === correct) {
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['מדהים! 🌟', 'כל הכבוד! ⭐', 'נהדר! 💫', 'נכון! ✨']
        : ['Correct! 🌟', 'Perfect! ⭐', 'Fantastic! 💫', 'Amazing! ✨']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      // Also say the complete word
      setTimeout(() => say(current.ttsWord), 400)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()

        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          completeGame('literacy', 'word-completion', 100)
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
        setSelectedLetter(null)
        setMood('idle')
        say(current.ttsWord)
      }, 1600)
    }
  }

  // Build the word display with the missing letter highlighted
  const renderWordDisplay = () => {
    const display = buildWordDisplay(current)
    const chars = display.split('')
    const wordDir = isRTL ? 'rtl' : 'ltr'

    return (
      <div
        className="flex items-center justify-center gap-1 flex-wrap"
        dir={wordDir}
      >
        {chars.map((ch, i) => {
          const isMissing = ch === '_'
          const isAnswered = answerState === 'correct' && isMissing

          return (
            <motion.div
              key={i}
              className={[
                'flex items-center justify-center rounded-xl border-2 font-bold',
                isMissing
                  ? isAnswered
                    ? 'border-kpop-gold bg-kpop-gold/20 text-kpop-gold'
                    : 'border-kpop-pink/60 bg-kpop-pink/10 text-kpop-pink'
                  : 'border-white/20 bg-white/5 text-white',
              ].join(' ')}
              style={{
                width: language === 'he' ? 52 : 48,
                height: language === 'he' ? 52 : 48,
                fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                fontSize: 28,
                direction: 'ltr',
              }}
              animate={isMissing && answerState === 'correct'
                ? { scale: [1, 1.3, 1], rotate: [0, -5, 5, 0] }
                : undefined}
              transition={{ duration: 0.4 }}
            >
              {isAnswered ? getMissingLetter(current) : ch}
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (!current) return null

  return (
    <GameShell
      title={isRTL ? 'השלמת מילה' : 'Word Completion'}
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
          message={s.tryAgain}
        />

        {/* ── Image + word display ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.word}
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* Emoji picture */}
            <motion.button
              className="flex items-center justify-center rounded-3xl border-2 border-kpop-cyan/40"
              style={{
                width: 120, height: 120,
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(124,58,237,0.2))',
                fontSize: 70,
                boxShadow: '0 0 30px rgba(6,182,212,0.3)',
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => say(current.ttsWord)}
            >
              {current.emoji}
            </motion.button>

            {/* TTS hint */}
            <p className="text-white/50 text-sm" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              🔊 {isRTL ? 'לחצי על התמונה לשמוע' : 'Tap picture to hear'}
            </p>

            {/* Word with blank */}
            <div className="px-4 py-3 rounded-2xl bg-kpop-card/60 border border-white/10">
              {renderWordDisplay()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Instruction ──────────────────────────────────────────── */}
        <motion.p
          className="text-white/70 text-lg text-center px-2"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isRTL
            ? 'איזו אות חסרה?'
            : 'Which letter is missing?'}
        </motion.p>

        {/* ── Letter choices ────────────────────────────────────────── */}
        <div className={`grid gap-3 w-full ${choiceCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {letterChoices.map((letter, i) => {
            const missing = getMissingLetter(current)
            const st =
              answerState === 'idle' ? 'default'
              : letter === missing ? 'correct'
              : letter === selectedLetter ? 'wrong'
              : 'disabled'

            return (
              <AnswerButton
                key={letter}
                label={letter}
                onClick={() => handleChoice(letter)}
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
