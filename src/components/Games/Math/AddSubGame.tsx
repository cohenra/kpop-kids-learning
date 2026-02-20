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
  getAddSubItems,
  getAddSubChoices,
  pickRandom,
  heNum,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type AddSubItem,
} from '../../../data/math'

// ─── Game 3: Addition & Subtraction ───────────────────────────────────────────
//
// Age 3: visual objects, addition only to 10, 2 choices
// Age 5: number equation display, add + subtract to 20, 4 choices, visual hint toggle

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

type AnswerState = 'idle' | 'correct' | 'wrong'

export function AddSubGame({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const choiceCount = age === 3 ? 2 : 4
  const [rounds] = useState<AddSubItem[]>(() =>
    pickRandom(getAddSubItems(age), ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [choices, setChoices] = useState<number[]>([])
  const [answerState, setAnswerState] = useState<AnswerState>('idle')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
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
    setShowHint(false)
    setMood('idle')

    const newChoices = getAddSubChoices(current.answer, age, choiceCount)
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

    if (answer === current.answer) {
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['נכון! 🌟', 'חישוב מעולה! ⭐', 'מדהים! 💫', 'כל הכבוד! ✨']
        : ['Correct! 🌟', 'Great math! ⭐', 'Amazing! 💫', 'Fantastic! ✨']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      const answerWord = language === 'he'
        ? `התשובה היא ${heNum(current.answer)}!`
        : `The answer is ${current.answer}!`
      setTimeout(() => say(answerWord), 400)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          completeGame('math', 'add-sub', 100)
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

  // ── Visual object display ──────────────────────────────────────────────────
  const renderVisualEquation = () => {
    const groupA = Array.from({ length: current.a })
    const groupB = Array.from({ length: current.b })
    const opSymbol = current.op === 'add' ? '+' : '−'
    // Age 3: always big (max 5 objects), age 5: scale down for large groups
    const emojiSize = age === 3 ? 44 : (current.a + current.b > 10 ? 22 : 28)
    // Age 3: wider container so big emojis can spread out
    const groupMaxW = age === 3 ? '130px' : '100px'
    const groupGap = age === 3 ? 'gap-2' : 'gap-1'

    return (
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Group A */}
        <div className={`flex flex-wrap ${groupGap} justify-center`} style={{ maxWidth: groupMaxW }}>
          {groupA.map((_, i) => (
            <motion.span
              key={`a-${i}`}
              style={{ fontSize: emojiSize }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 400 }}
            >
              {current.emojiA}
            </motion.span>
          ))}
        </div>

        {/* Operator */}
        <span
          className="font-bold"
          style={{
            fontSize: age === 3 ? 40 : 32,
            color: current.op === 'add' ? '#06B6D4' : '#EC4899',
            fontFamily: 'Fredoka One, sans-serif',
          }}
        >
          {opSymbol}
        </span>

        {/* Group B */}
        {current.op === 'add' ? (
          <div className={`flex flex-wrap ${groupGap} justify-center`} style={{ maxWidth: groupMaxW }}>
            {groupB.map((_, i) => (
              <motion.span
                key={`b-${i}`}
                style={{ fontSize: emojiSize }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (current.a + i) * 0.06, type: 'spring', stiffness: 400 }}
              >
                {current.emojiB}
              </motion.span>
            ))}
          </div>
        ) : (
          // Subtraction: show group A with some crossed out
          <div className={`flex flex-wrap ${groupGap} justify-center relative`} style={{ maxWidth: groupMaxW }}>
            {groupA.map((_, i) => (
              <span
                key={`cross-${i}`}
                style={{
                  fontSize: emojiSize,
                  opacity: i >= current.a - current.b ? 0.25 : 1,
                  textDecoration: i >= current.a - current.b ? 'line-through' : 'none',
                }}
              >
                {current.emojiA}
              </span>
            ))}
          </div>
        )}

        {/* Equals + blank */}
        <span
          className="font-bold"
          style={{ fontSize: age === 3 ? 40 : 32, color: '#F59E0B', fontFamily: 'Fredoka One, sans-serif' }}
        >
          =
        </span>
        <div
          className="rounded-xl border-2 border-kpop-gold/60 bg-kpop-gold/10 flex items-center justify-center"
          style={{
            width: age === 3 ? 64 : 52,
            height: age === 3 ? 64 : 52,
            fontSize: age === 3 ? 36 : 28,
            fontFamily: 'Fredoka One, sans-serif',
            color: '#F59E0B',
          }}
        >
          {answerState === 'correct' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {current.answer}
            </motion.span>
          ) : '?'}
        </div>
      </div>
    )
  }

  // ── Number equation display (age 5) ────────────────────────────────────────
  const renderNumberEquation = () => {
    const opSymbol = current.op === 'add' ? '+' : '−'
    return (
      <div className="flex items-center justify-center gap-3">
        {[
          { value: String(current.a), color: '#06B6D4' },
          { value: opSymbol, color: current.op === 'add' ? '#06B6D4' : '#EC4899' },
          { value: String(current.b), color: '#06B6D4' },
          { value: '=', color: '#F59E0B' },
          {
            value: answerState === 'correct' ? String(current.answer) : '?',
            color: '#F59E0B',
            box: true,
          },
        ].map((item, i) => (
          <motion.span
            key={i}
            className={item.box ? 'rounded-xl border-2 border-kpop-gold/60 bg-kpop-gold/10 flex items-center justify-center' : ''}
            style={{
              fontSize: 40,
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              color: item.color,
              fontWeight: 'bold',
              width: item.box ? 60 : undefined,
              height: item.box ? 60 : undefined,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            {item.value}
          </motion.span>
        ))}
      </div>
    )
  }

  if (!current) return null

  const titleHe = current.op === 'add' ? 'חיבור' : 'חיסור'
  const titleEn = current.op === 'add' ? 'Addition' : 'Subtraction'

  return (
    <GameShell
      title={isRTL ? titleHe : titleEn}
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
          message={isRTL ? 'נסי שוב! חשבי לאט' : 'Try again! Think slowly'}
        />

        {/* ── Equation display ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={roundIdx}
            className="flex flex-col items-center gap-4 w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* TTS question button */}
            <motion.button
              className="text-white/70 text-lg text-center px-4 py-2 rounded-2xl
                         bg-kpop-card/60 border border-white/10"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif', minHeight: 44 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => say(language === 'he' ? current.ttsHe : current.ttsEn)}
            >
              🔊 {language === 'he' ? current.ttsHe : current.ttsEn}
            </motion.button>

            {/* Equation area */}
            <div
              className="rounded-3xl border border-white/10 p-4 w-full flex flex-col items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(45,42,74,0.9), rgba(30,27,46,0.9))',
                boxShadow: '0 0 20px rgba(124,58,237,0.15)',
              }}
            >
              {age === 3 ? renderVisualEquation() : renderNumberEquation()}
            </div>

            {/* Age 5: visual hint toggle */}
            {age === 5 && (
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-full
                           bg-kpop-card/70 border border-kpop-purple/30 text-white/60
                           font-bold text-base"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 44 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHint((h) => !h)}
              >
                {showHint ? '🔢' : '👁️'} {isRTL ? (showHint ? 'הסתר עזרה' : 'הצג עזרה') : (showHint ? 'Hide hint' : 'Show hint')}
              </motion.button>
            )}

            {/* Visual hint for age 5 */}
            {age === 5 && showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-white/10 p-3 w-full"
                style={{ background: 'rgba(45,42,74,0.7)' }}
              >
                {renderVisualEquation()}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Answer choices ──────────────────────────────────────────── */}
        <div className={`grid gap-3 w-full ${choiceCount === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {choices.map((num, i) => {
            const st =
              answerState === 'idle' ? 'default'
              : num === current.answer ? 'correct'
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
