import { useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useProgress } from '../../hooks/useProgress'
import { Character } from '../Character/Character'
import { StarParticles } from '../UI/StarParticles'
import { SparkCounter } from '../UI/SparkCounter'

// ─── Shared Room Hub ──────────────────────────────────────────────────────────
//
// All room hubs (Literacy, Math, Music, Logic, Social, Nature) use this.
// To add a new game: add one entry to the GAMES array in the room file.
// To add a new room: create a room file with a GAMES array and <RoomHub>.
//
// State machine:
//
//   'menu'
//     ├─ tap card → gameId           (renders <game.component>)
//     │    ├─ onComplete(sparks) → check allComplete
//     │    │    ├─ all done → 'all-complete'
//     │    │    └─ not done → 'menu'
//     │    └─ onBack → 'menu'
//     └─ back button → navigate('/home')

// Props every game component must accept
export interface GameComponentProps {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

// Config for one game card in this room
export interface GameConfig {
  id: string
  component: ComponentType<GameComponentProps>
  emoji: string
  titleHe: string
  titleEn: string
  descHe: string
  descEn: string
  color: string
  glowColor: string
  /** Free-play games are always accessible but never marked complete */
  freePlay?: boolean
  /** Custom emojis for the all-complete celebration burst */
  celebEmojis?: string[]
}

interface RoomHubProps {
  roomId: string
  titleHe: string
  titleEn: string
  subtitleHe: string
  subtitleEn: string
  games: GameConfig[]
}

const DEFAULT_CELEB_EMOJIS = ['✨', '⭐', '💫', '🌟', '✦', '★', '🎉', '🎊', '💥', '🏆', '🎵', '🎤']

export function RoomHub({
  roomId,
  titleHe,
  titleEn,
  subtitleHe,
  subtitleEn,
  games,
}: RoomHubProps) {
  const navigate = useNavigate()
  const { isRTL, addSparks, profileColors, backArrow } = useApp()
  const { isGameCompleted } = useProgress()

  const [activeGameId, setActiveGameId] = useState<string | null>(null)
  const [showAllComplete, setShowAllComplete] = useState(false)
  const [lastEarned, setLastEarned] = useState(0)

  const trackableGames = games.filter((g) => !g.freePlay)
  const allComplete = trackableGames.every((g) => isGameCompleted(roomId, g.id))

  const handleGameComplete = (gameId: string, sparksEarned: number) => {
    setLastEarned(sparksEarned)
    if (sparksEarned > 0) addSparks(sparksEarned)

    // Check allComplete including this game
    const game = games.find((g) => g.id === gameId)
    if (!game?.freePlay) {
      const completedCount = trackableGames.filter(
        (g) => g.id === gameId || isGameCompleted(roomId, g.id)
      ).length
      if (completedCount >= trackableGames.length) {
        setActiveGameId(null)
        setShowAllComplete(true)
        return
      }
    }
    setActiveGameId(null)
  }

  // ── Render active game ─────────────────────────────────────────────────────
  if (activeGameId) {
    const game = games.find((g) => g.id === activeGameId)
    if (game) {
      const GameComponent = game.component
      return (
        <GameComponent
          onComplete={(sparks) => handleGameComplete(game.id, sparks)}
          onBack={() => setActiveGameId(null)}
        />
      )
    }
  }

  // ── All-complete celebration ───────────────────────────────────────────────
  if (showAllComplete) {
    const celebEmojis = games[0]?.celebEmojis ?? DEFAULT_CELEB_EMOJIS
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
      >
        <StarParticles />

        {celebEmojis.map((emoji, i) => (
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
            {emoji}
          </motion.span>
        ))}

        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Character
            mood="excited"
            size={160}
            hairColor={profileColors.hair}
            outfitColor={profileColors.outfit}
          />

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
            >
              ✨
            </motion.span>
            <div>
              <p
                className="text-kpop-gold font-bold text-3xl ltr-number"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
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
            {isRTL ? `${backArrow} חזרה לבית` : `Back to Home ${backArrow}`}
          </motion.button>
        </motion.div>
      </div>
    )
  }

  // ── Menu: game card grid ───────────────────────────────────────────────────
  const title = isRTL ? titleHe : titleEn
  const subtitle = isRTL ? subtitleHe : subtitleEn

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
          <span>{backArrow}</span>
          {isRTL ? 'חזרה' : 'Back'}
        </motion.button>

        <h1
          className="font-bold text-white text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {title}
        </h1>

        <SparkCounter />
      </div>

      {/* Character */}
      <div className="relative z-10 flex justify-center pt-1">
        <Character
          mood={allComplete ? 'excited' : 'happy'}
          size={100}
          hairColor={profileColors.hair}
          outfitColor={profileColors.outfit}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-center text-white/60 px-6 pb-2 text-base"
        style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {subtitle}
      </motion.p>

      {/* Game cards grid */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollable px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {games.map((game, i) => {
            const done = !game.freePlay && isGameCompleted(roomId, game.id)
            const cardTitle = isRTL ? game.titleHe : game.titleEn
            const cardDesc = isRTL ? game.descHe : game.descEn

            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200 }}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setActiveGameId(game.id)}
                className="relative rounded-3xl p-4 border border-white/10 text-start
                           flex flex-col gap-2 overflow-hidden min-h-[140px]"
                style={{
                  background: done
                    ? `linear-gradient(135deg, ${game.color}44, rgba(45,42,74,0.9))`
                    : `linear-gradient(135deg, ${game.color}22, rgba(45,42,74,0.95))`,
                  boxShadow: done ? `0 0 20px ${game.glowColor}` : 'none',
                }}
              >
                {/* Glow corner */}
                <div
                  className="absolute top-0 end-0 w-16 h-16 rounded-full opacity-25 pointer-events-none"
                  style={{
                    background: game.color,
                    filter: 'blur(14px)',
                    transform: 'translate(40%, -40%)',
                  }}
                />

                <span className="text-4xl">{game.emoji}</span>

                <h3
                  className="font-bold text-white text-base leading-tight"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  {cardTitle}
                </h3>

                <p
                  className="text-white/50 text-xs leading-snug"
                  style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                >
                  {cardDesc}
                </p>

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
                {!done && !game.freePlay && (
                  <motion.div
                    className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full"
                    style={{ background: game.color }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
                {game.freePlay && (
                  <div className="absolute top-2 end-2 text-white/30 text-sm">🎹</div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* All-complete indicator */}
        {allComplete && (
          <motion.div
            className="mt-4 rounded-3xl p-4 border border-kpop-gold/40 text-center"
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
            <p className="text-white/50 text-sm mt-1" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL ? 'תוכלי לשחק שוב לתרגול!' : 'Play again for more practice!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
