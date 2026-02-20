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
  getLetters,
  pickRandom,
  shuffle,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type LetterItem,
} from '../../../data/literacy'
import { t } from '../../../i18n/strings'

// ─── Game 1: Letter Recognition ───────────────────────────────────────────────
//
// Show a large letter → play its sound via TTS
// Age 3: 2 choices | Age 5: 4 choices
// 10 rounds, randomised letters

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function LetterRecognition({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()
  const s = t(language)

  const choiceCount = age === 3 ? 2 : 4
  const allLetters = getLetters(language)

  // Precompute the 10 rounds
  const [rounds] = useState<LetterItem[]>(() =>
    pickRandom(allLetters, ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [choices, setChoices] = useState<LetterItem[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'encouraging'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = rounds[roundIdx]

  // Build answer choices for current round
  const buildChoices = useCallback((target: LetterItem) => {
    const others = allLetters.filter((l) => l.letter !== target.letter)
    const distractors = pickRandom(others, choiceCount - 1)
    const all = shuffle([target, ...distractors])
    setChoices(all)
  }, [allLetters, choiceCount])

  // On round change: reset state and read letter aloud
  useEffect(() => {
    if (!current) return
    setAnswerState('idle')
    setSelectedLetter(null)
    setMood('idle')
    buildChoices(current)
    // Brief delay then speak
    const t1 = setTimeout(() => say(current.sound), 400)
    return () => {
      clearTimeout(t1)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, buildChoices, say])

  const handleChoice = (item: LetterItem) => {
    if (answerState !== 'idle') return
    setSelectedLetter(item.letter)

    if (item.letter === current.letter) {
      // ── Correct ──────────────────────────────────────────────────
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['מדהים! 🌟', 'כל הכבוד! ⭐', 'נהדר! 💫', 'יפה מאוד! ✨']
        : ['Amazing! 🌟', 'Great job! ⭐', 'Fantastic! 💫', 'Well done! ✨']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()

        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          // All rounds done → record game + bonus sparks
          completeGame('literacy', 'letter-recognition', 100)
          setTotalSparks((prev) => prev + SPARKS_COMPLETION_BONUS)
          setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
        } else {
          setRoundIdx((r) => r + 1)
        }
      }, 1400)
    } else {
      // ── Wrong ────────────────────────────────────────────────────
      setAnswerState('wrong')
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowEncouragement(false)
        setAnswerState('idle')
        setSelectedLetter(null)
        setMood('idle')
        // Re-read the letter so child hears it again
        say(current.sound)
      }, 1600)
    }
  }

  const handleSpeakAgain = () => {
    if (current) say(current.sound)
  }

  if (!current) return null

  return (
    <GameShell
      title={isRTL ? 'זיהוי אותיות' : 'Letter Recognition'}
      round={roundIdx + 1}
      totalRounds={ROUNDS_PER_GAME}
      mood={mood}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-4 pt-2 relative">
        {/* Overlays */}
        <CelebrationOverlay
          show={showCelebration}
          message={celebMessage}
          sparksEarned={SPARKS_PER_ROUND}
        />
        <EncouragementOverlay
          show={showEncouragement}
          message={s.tryAgain}
        />

        {/* ── Big letter display ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.letter}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0.6, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* Letter card */}
            <motion.div
              className="flex items-center justify-center rounded-3xl border-2 border-kpop-purple/50"
              style={{
                width: 140, height: 140,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.2))',
                boxShadow: '0 0 40px rgba(124,58,237,0.4)',
              }}
              animate={{ boxShadow: [
                '0 0 30px rgba(124,58,237,0.3)',
                '0 0 50px rgba(236,72,153,0.5)',
                '0 0 30px rgba(124,58,237,0.3)',
              ]}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="select-none"
                style={{
                  fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                  fontSize: 80,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  direction: 'ltr', // letters always LTR
                }}
              >
                {current.letter}
              </span>
            </motion.div>

            {/* Speak again button */}
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-kpop-card/70 border border-kpop-cyan/30 text-kpop-cyan
                         font-bold text-base"
              whileTap={{ scale: 0.9 }}
              onClick={handleSpeakAgain}
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 44 }}
            >
              🔊 {isRTL ? 'שמעי שוב' : 'Hear again'}
            </motion.button>
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
            ? 'איזו תמונה מתחילה באות הזאת?'
            : 'Which picture starts with this letter?'}
        </motion.p>

        {/* ── Answer choices ────────────────────────────────────────── */}
        <div
          className={`grid gap-3 w-full ${
            choiceCount === 2 ? 'grid-cols-2' : 'grid-cols-2'
          }`}
        >
          {choices.map((item, i) => {
            const st =
              answerState === 'idle' ? 'default'
              : item.letter === current.letter ? 'correct'
              : item.letter === selectedLetter ? 'wrong'
              : 'disabled'

            return (
              <AnswerButton
                key={item.letter}
                label={item.word}
                emoji={item.emoji}
                onClick={() => handleChoice(item)}
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
