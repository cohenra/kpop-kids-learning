import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Character } from '../components/Character/Character'
import { Button } from '../components/UI/Button'
import { t } from '../i18n/strings'
import { ROOMS } from '../data/games'
import type { RoomId } from '../data/games'

// Room-specific implementations
import { LiteracyRoom } from '../components/Games/Literacy/LiteracyRoom'
import { MathRoom } from '../components/Games/Math/MathRoom'

// ─── Game Room dispatcher ─────────────────────────────────────────────────────
//
// Routes to the correct room implementation based on roomId.
// Rooms without a Phase 2 implementation show the "coming soon" placeholder.

export function GameRoom() {
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: RoomId }>()
  const { activeProfile, language, isRTL } = useApp()
  const s = t(language)

  if (!activeProfile || !roomId) {
    navigate('/home')
    return null
  }

  const room = ROOMS.find((r) => r.id === roomId)
  if (!room) {
    navigate('/home')
    return null
  }

  // ── Dispatch to real room implementations ─────────────────────────────────
  if (roomId === 'literacy') {
    return <LiteracyRoom />
  }
  if (roomId === 'math') {
    return <MathRoom />
  }

  // ── Placeholder for rooms not yet built ───────────────────────────────────
  const roomStrings = s.rooms[roomId as RoomId]
  const hairColor = activeProfile.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile.id === 1 ? '#7C3AED' : '#EC4899'

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
    >
      {/* Back button */}
      <motion.button
        className="absolute top-4 start-4 z-20 flex items-center gap-2 text-white/60
                   bg-kpop-card/60 px-4 py-2 rounded-full border border-white/10 font-bold"
        whileTap={{ scale: 0.93 }}
        onClick={() => navigate('/home')}
        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
      >
        <span>{isRTL ? '→' : '←'}</span>
        {s.back}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-6 px-6 text-center max-w-sm w-full"
      >
        <motion.div
          className="text-8xl"
          animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {room.emoji}
        </motion.div>

        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {roomStrings.name}
        </h1>

        <p
          className="text-white/60 text-xl"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        >
          {roomStrings.tagline}
        </p>

        <Character
          mood="thinking"
          size={130}
          hairColor={hairColor}
          outfitColor={outfitColor}
        />

        <div className="bg-kpop-card/80 rounded-3xl p-5 border border-white/10 w-full">
          <p
            className="text-white/70 text-lg"
            style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          >
            {isRTL
              ? '🚧 המשחקים בחדר זה יצאו בקרוב! 🚧'
              : '🚧 Games for this room are coming soon! 🚧'}
          </p>
        </div>

        <Button onClick={() => navigate('/home')} variant="secondary" size="lg">
          {s.back}
        </Button>
      </motion.div>
    </div>
  )
}
