import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import {
  getReadingWords,
  getReadingSentences,
  pickRandom,
  ROUNDS_PER_GAME,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  type ReadingWordItem,
  type ReadingSentenceItem,
} from '../../../data/literacy'

// ─── Game 3: First Reading ────────────────────────────────────────────────────
//
// Age 3: single word + image → TTS reads it → child taps word → sparkle
// Age 5: short sentence → word-by-word TTS highlight → tap each word to confirm

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

export function FirstReading({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const [roundIdx, setRoundIdx] = useState(0)
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')

  // Age 3 state
  const [wordTapped, setWordTapped] = useState(false)
  const [wordRounds] = useState<ReadingWordItem[]>(() =>
    pickRandom(getReadingWords(language), ROUNDS_PER_GAME)
  )

  // Age 5 state
  const [sentenceRounds] = useState<ReadingSentenceItem[]>(() =>
    pickRandom(getReadingSentences(language), ROUNDS_PER_GAME)
  )
  const [tappedWords, setTappedWords] = useState<Set<number>>(new Set())
  const [highlightedWord, setHighlightedWord] = useState<number>(-1)
  const ttsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentWord = wordRounds[roundIdx]
  const currentSentence = sentenceRounds[roundIdx]

  // On round change
  useEffect(() => {
    setWordTapped(false)
    setTappedWords(new Set())
    setHighlightedWord(-1)
    setMood('idle')

    const text = age === 3
      ? currentWord?.ttsWord
      : currentSentence?.ttsSentence

    if (text) {
      const timer = setTimeout(() => say(text), 400)
      return () => {
        clearTimeout(timer)
        if (ttsTimer.current) clearTimeout(ttsTimer.current)
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
      }
    }
  }, [roundIdx, age, currentWord, currentSentence, say])

  // Age 5: highlight words as TTS reads
  useEffect(() => {
    if (age !== 5 || !currentSentence) return
    const words = currentSentence.words
    let delay = 500
    const timers: ReturnType<typeof setTimeout>[] = []
    words.forEach((_, i) => {
      const t = setTimeout(() => setHighlightedWord(i), delay)
      timers.push(t)
      delay += 500
    })
    const clearT = setTimeout(() => setHighlightedWord(-1), delay)
    timers.push(clearT)
    return () => timers.forEach(clearTimeout)
  }, [roundIdx, age, currentSentence])

  const advanceRound = (earned: number) => {
    const newTotal = totalSparks + earned
    setTotalSparks(newTotal)
    setMood('excited')
    playCorrect()

    const msgs = isRTL
      ? ['קראת! 📚', 'מדהים! 🌟', 'כל הכבוד! ⭐']
      : ['You read it! 📚', 'Amazing! 🌟', 'Great job! ⭐']
    setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
    setShowCelebration(true)

    autoAdvanceTimer.current = setTimeout(() => {
      setShowCelebration(false)
      playSpark()

      if (roundIdx + 1 >= ROUNDS_PER_GAME) {
        completeGame('literacy', 'first-reading', 100)
        setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
      } else {
        setRoundIdx((r) => r + 1)
      }
    }, 1400)
  }

  // ── Age 3: tap the single word ────────────────────────────────────────────
  const handleAge3Tap = () => {
    if (wordTapped) return
    setWordTapped(true)
    say(currentWord.ttsWord)
    advanceRound(SPARKS_PER_ROUND)
  }

  // ── Age 5: tap each word in the sentence ─────────────────────────────────
  const handleWordTap = (idx: number) => {
    if (tappedWords.has(idx)) return
    const words = currentSentence.words
    const next = new Set(tappedWords)
    next.add(idx)
    setTappedWords(next)
    // Speak just that word
    say(words[idx].replace(/[.,!?]/g, ''))

    if (next.size >= words.length) {
      // All words tapped
      advanceRound(SPARKS_PER_ROUND)
    }
  }

  if (age === 3 && !currentWord) return null
  if (age === 5 && !currentSentence) return null

  return (
    <GameShell
      title={isRTL ? 'קריאה ראשונה' : 'First Reading'}
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

        {/* ── Age 3: Word + image ───────────────────────────────── */}
        {age === 3 && currentWord && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord.word}
              className="flex flex-col items-center gap-6 flex-1 justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              {/* Big emoji image */}
              <motion.div
                className="text-8xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentWord.emoji}
              </motion.div>

              {/* Instruction */}
              <p className="text-white/60 text-xl text-center"
                style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                {isRTL ? '🔊 תקשיבי, ואז לחצי על המילה!' : '🔊 Listen, then tap the word!'}
              </p>

              {/* The word — tap to "read" it */}
              <motion.button
                className="rounded-3xl border-2 px-10 py-6 text-center select-none"
                style={{
                  borderColor: wordTapped ? '#F59E0B' : 'rgba(124,58,237,0.6)',
                  background: wordTapped
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(236,72,153,0.2))'
                    : 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))',
                  boxShadow: wordTapped
                    ? '0 0 30px rgba(245,158,11,0.5)'
                    : '0 0 20px rgba(124,58,237,0.3)',
                  minWidth: 200, minHeight: 100,
                  direction: isRTL ? 'rtl' : 'ltr',
                }}
                whileTap={{ scale: 0.92 }}
                onClick={handleAge3Tap}
              >
                <span
                  style={{
                    fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                    fontSize: 52,
                    background: wordTapped
                      ? 'linear-gradient(90deg, #F59E0B, #EC4899)'
                      : 'linear-gradient(90deg, #EC4899, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {currentWord.word}
                </span>
              </motion.button>

              {wordTapped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 text-3xl"
                >
                  {['✨', '⭐', '✨'].map((e, i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -10, 0], scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6, delay: i * 0.15, repeat: 2 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Age 5: Sentence with word-by-word tapping ────────────── */}
        {age === 5 && currentSentence && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSentence.sentence}
              className="flex flex-col items-center gap-5 flex-1 justify-center w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            >
              {/* Sentence emoji */}
              <motion.div
                className="text-6xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentSentence.emoji}
              </motion.div>

              {/* Instruction */}
              <p className="text-white/60 text-base text-center"
                style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                {isRTL
                  ? '🔊 הקשיבי ולחצי על כל מילה!'
                  : '🔊 Listen and tap each word!'}
              </p>

              {/* Listen again */}
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-full
                           bg-kpop-card/70 border border-kpop-cyan/30 text-kpop-cyan
                           font-bold text-base"
                whileTap={{ scale: 0.9 }}
                onClick={() => say(currentSentence.ttsSentence)}
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 44 }}
              >
                🔊 {isRTL ? 'שמעי שוב' : 'Hear again'}
              </motion.button>

              {/* Words layout — RTL aware */}
              <div
                className="flex flex-wrap justify-center gap-2 px-2"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {currentSentence.words.map((word, i) => {
                  const isTapped = tappedWords.has(i)
                  const isHighlighted = highlightedWord === i

                  return (
                    <motion.button
                      key={i}
                      className="rounded-2xl border-2 px-4 py-3 font-bold text-xl select-none"
                      style={{
                        minHeight: 64,
                        minWidth: 64,
                        fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                        borderColor: isTapped
                          ? '#F59E0B'
                          : isHighlighted
                          ? '#EC4899'
                          : 'rgba(255,255,255,0.2)',
                        background: isTapped
                          ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(236,72,153,0.2))'
                          : isHighlighted
                          ? 'rgba(236,72,153,0.2)'
                          : 'rgba(45,42,74,0.6)',
                        color: isTapped ? '#F59E0B' : 'white',
                        boxShadow: isTapped
                          ? '0 0 15px rgba(245,158,11,0.4)'
                          : isHighlighted
                          ? '0 0 15px rgba(236,72,153,0.4)'
                          : 'none',
                      }}
                      whileTap={{ scale: 0.92 }}
                      animate={isHighlighted && !isTapped
                        ? { y: [0, -4, 0] }
                        : isTapped
                        ? { scale: [1, 1.1, 1] }
                        : {}}
                      transition={{ duration: 0.3 }}
                      onClick={() => handleWordTap(i)}
                    >
                      {word}
                    </motion.button>
                  )
                })}
              </div>

              {/* Progress indicator: how many words tapped */}
              <div className="flex gap-1.5">
                {currentSentence.words.map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: tappedWords.has(i) ? '#F59E0B' : 'rgba(255,255,255,0.2)',
                    }}
                    animate={tappedWords.has(i)
                      ? { scale: [1, 1.4, 1] }
                      : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </GameShell>
  )
}
