import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../../context/AppContext'
import { useProgress } from '../../../hooks/useProgress'
import { Character } from '../../Character/Character'
import { StarParticles } from '../../UI/StarParticles'
import { SparkCounter } from '../../UI/SparkCounter'
import { CountingGame } from './CountingGame'
import { ComparisonGame } from './ComparisonGame'
import { AddSubGame } from './AddSubGame'
import { PatternGame } from './PatternGame'
import { NumberRecognition } from './NumberRecognition'
import { t } from '../../../i18n/strings'

// ─── Math Room hub ────────────────────────────────────────────────────────────
//
// Recording Studio — "The Beat & Numbers"
// 5 game cards: 2×2 grid + 1 wide card centred at bottom

type GameId = 'counting' | 'comparison' | 'add-sub' | 'patterns' | 'number-recognition'
type HubState = 'menu' | GameId | 'all-complete'

interface GameCard {
  id: GameId
  emoji: string
  titleHe: string
  titleEn: string
  descHe: string
  descEn: string
  color: string
  glowColor: string
}

const GAME_CARDS: GameCard[] = [
  {
    id: 'counting',
    emoji: '🔢',
    titleHe: 'ספירה',
    titleEn: 'Counting',
    descHe: 'ספרי את האיקסים על הבמה',
    descEn: 'Count the objects on stage',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  {
    id: 'comparison',
    emoji: '⚖️',
    titleHe: 'השוואה',
    titleEn: 'Comparison',
    descHe: 'איזה צד גדול יותר?',
    descEn: 'Which side has more?',
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.4)',
  },
  {
    id: 'add-sub',
    emoji: '➕',
    titleHe: 'חיבור וחיסור',
    titleEn: 'Add & Subtract',
    descHe: 'פתרי את החשבון',
    descEn: 'Solve the equation',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'patterns',
    emoji: '🔄',
    titleHe: 'תבניות',
    titleEn: 'Patterns',
    descHe: 'מה הולך הלאה?',
    descEn: 'What comes next?',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'number-recognition',
    emoji: '🔍',
    titleHe: 'זיהוי מספרים',
    titleEn: 'Number Recognition',
    descHe: 'מצאי את הקבוצה הנכונה',
    descEn: 'Find the matching group',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
  },
]

// First 4 cards in 2×2, 5th card full-width below
const GRID_CARDS = GAME_CARDS.slice(0, 4)
const WIDE_CARD = GAME_CARDS[4]

export function MathRoom() {
  const navigate = useNavigate()
  const { language, isRTL, activeProfile, addSparks } = useApp()
  const { isGameCompleted } = useProgress()
  const s = t(language)

  const [hubState, setHubState] = useState<HubState>('menu')
  const [lastEarned, setLastEarned] = useState(0)

  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899'

  const allComplete = GAME_CARDS.every((g) => isGameCompleted('math', g.id))

  const handleGameComplete = (gameId: GameId, sparksEarned: number) => {
    setLastEarned(sparksEarned)
    addSparks(sparksEarned)

    // Count how many are completed including the one just finished
    const completedCount = GAME_CARDS.filter(
      (g) => g.id === gameId || isGameCompleted('math', g.id)
    ).length

    if (completedCount >= GAME_CARDS.length) {
      setHubState('all-complete')
    } else {
      setHubState('menu')
    }
  }

  // ── Active game rendering ─────────────────────────────────────────────────
  if (hubState === 'counting') {
    return (
      <CountingGame
        onComplete={(sparks) => handleGameComplete('counting', sparks)}
        onBack={() => setHubState('menu')}
      />
    )
  }
  if (hubState === 'comparison') {
    return (
      <ComparisonGame
        onComplete={(sparks) => handleGameComplete('comparison', sparks)}
        onBack={() => setHubState('menu')}
      />
    )
  }
  if (hubState === 'add-sub') {
    return (
      <AddSubGame
        onComplete={(sparks) => handleGameComplete('add-sub', sparks)}
        onBack={() => setHubState('menu')}
      />
    )
  }
  if (hubState === 'patterns') {
    return (
      <PatternGame
        onComplete={(sparks) => handleGameComplete('patterns', sparks)}
        onBack={() => setHubState('menu')}
      />
    )
  }
  if (hubState === 'number-recognition') {
    return (
      <NumberRecognition
        onComplete={(sparks) => handleGameComplete('number-recognition', sparks)}
        onBack={() => setHubState('menu')}
      />
    )
  }

  // ── All-complete celebration ───────────────────────────────────────────────
  if (hubState === 'all-complete') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
      >
        <StarParticles />

        {[...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl pointer-events-none"
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.8, 1],
              x: Math.cos((i / 12) * Math.PI * 2) * 160,
              y: Math.sin((i / 12) * Math.PI * 2) * 160,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1, delay: i * 0.06, ease: 'easeOut' }}
          >
            {['✨', '⭐', '💫', '🌟', '✦', '★', '🎉', '🎊', '🔢', '🏆', '🎵', '🎤'][i]}
          </motion.span>
        ))}

        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Character mood="excited" size={160} hairColor={hairColor} outfitColor={outfitColor} />

          <motion.h1
            className="text-4xl font-bold"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              background: 'linear-gradient(90deg, #F59E0B, #EC4899, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {isRTL ? '🎉 כל הכבוד! גמרת הכל!' : '🎉 Amazing! You did it all!'}
          </motion.h1>

          <motion.div
            className="flex items-center gap-3 bg-kpop-card/80 rounded-3xl px-6 py-3
                       border border-kpop-gold/40"
            style={{ boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, delay: 0.7 }}
            >✨</motion.span>
            <div>
              <p className="text-kpop-gold font-bold text-3xl ltr-number"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                +{lastEarned}
              </p>
              <p className="text-white/50 text-sm">
                {isRTL ? 'ניצוצות הרווחת!' : 'sparks earned!'}
              </p>
            </div>
          </motion.div>

          <motion.button
            className="mt-2 rounded-3xl px-10 py-4 font-bold text-white text-xl
                       border border-kpop-purple/50"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              minHeight: 72,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home')}
          >
            {isRTL ? '← חזרה לבית' : 'Back to Home →'}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── Menu: game selector ────────────────────────────────────────────────────
  const renderCard = (game: GameCard, i: number, wide = false) => {
    const done = isGameCompleted('math', game.id)
    return (
      <motion.button
        key={game.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200 }}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => setHubState(game.id)}
        className={`relative rounded-3xl p-4 border border-white/10 text-start
                   flex ${wide ? 'flex-row items-center gap-4' : 'flex-col'} gap-2
                   overflow-hidden`}
        style={{
          minHeight: wide ? 80 : 140,
          background: done
            ? `linear-gradient(135deg, ${game.color}44, rgba(45,42,74,0.9))`
            : `linear-gradient(135deg, ${game.color}22, rgba(45,42,74,0.95))`,
          boxShadow: done ? `0 0 20px ${game.glowColor}` : 'none',
        }}
      >
        {/* Glow corner */}
        <div
          className="absolute top-0 end-0 w-16 h-16 rounded-full opacity-20 pointer-events-none"
          style={{ background: game.color, filter: 'blur(14px)', transform: 'translate(40%, -40%)' }}
        />

        <span className={wide ? 'text-4xl shrink-0' : 'text-4xl'}>{game.emoji}</span>

        <div className="flex flex-col gap-0.5 min-w-0">
          <h3
            className="font-bold text-white leading-tight"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              fontSize: wide ? 18 : 15,
            }}
          >
            {language === 'he' ? game.titleHe : game.titleEn}
          </h3>
          <p
            className="text-white/50 text-xs leading-snug"
            style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          >
            {language === 'he' ? game.descHe : game.descEn}
          </p>
        </div>

        {done && (
          <motion.div
            className="absolute top-2 end-2 text-kpop-gold text-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            ⭐
          </motion.div>
        )}
        {!done && (
          <motion.div
            className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full"
            style={{ background: game.color }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        )}
      </motion.button>
    )
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
    >
      <StarParticles />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <motion.button
          className="flex items-center gap-1.5 text-white/60 font-bold
                     bg-kpop-card/60 px-3 py-2 rounded-full border border-white/10 text-base"
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/home')}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          <span>{isRTL ? '→' : '←'}</span>
          {s.back}
        </motion.button>

        <h1
          className="font-bold text-white text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          🔢 {isRTL ? 'אולפן הקצב' : 'Beat Studio'}
        </h1>

        <SparkCounter />
      </div>

      {/* Character */}
      <div className="relative z-10 flex justify-center pt-1">
        <Character
          mood={allComplete ? 'excited' : 'happy'}
          size={90}
          hairColor={hairColor}
          outfitColor={outfitColor}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-center text-white/60 px-6 pb-2 text-sm"
        style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isRTL
          ? 'שירים צריכים ספירה — בואי נחשב!'
          : "Songs need counting — let's do the math!"}
      </motion.p>

      {/* Game cards */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollable px-4 pb-4">
        {/* 2×2 grid for first 4 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {GRID_CARDS.map((game, i) => renderCard(game, i, false))}
        </div>

        {/* Wide card for 5th game */}
        {renderCard(WIDE_CARD, 4, true)}

        {/* All complete indicator */}
        {allComplete && (
          <motion.div
            className="mt-3 rounded-3xl p-4 border border-kpop-gold/40 text-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="text-kpop-gold font-bold text-xl"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              🏆 {isRTL ? 'כל המשחקים הושלמו!' : 'All games completed!'}
            </p>
            <p className="text-white/50 text-sm mt-1"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL ? 'תוכלי לשחק שוב לתרגול!' : 'Play again for more practice!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
