import { useEffect } from 'react'
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
import { MusicRoom } from '../components/Games/Music/MusicRoom'
import { LogicRoom } from '../components/Games/Logic/LogicRoom'
import { CreativeRoom } from '../components/Games/Creative/CreativeRoom'

// ─── Game Room dispatcher ─────────────────────────────────────────────────────
//
// Routes to the correct room implementation based on roomId.
// To add a new room: import its component and add one entry to ROOM_REGISTRY.
// Rooms not in the registry fall through to the "coming soon" placeholder.
//
//   roomId (URL param)
//     ↓
//   ROOM_REGISTRY lookup
//     ├─ found  → render <RoomComponent />
//     └─ not found → "coming soon" placeholder

type RoomRegistry = Partial<Record<RoomId, React.FC>>

const ROOM_REGISTRY: RoomRegistry = {
  literacy: LiteracyRoom,
  math:     MathRoom,
  music:    MusicRoom,
  logic:    LogicRoom,
  creative: CreativeRoom,
}

export function GameRoom() {
  const navigate = useNavigate()
  const { roomId } = useParams<{ roomId: RoomId }>()
  const { activeProfile, language, isRTL, profileColors, backArrow } = useApp()
  const s = t(language)

  // Guard: redirect during next tick, not during render
  useEffect(() => {
    if (!activeProfile || !roomId || !ROOMS.find((r) => r.id === roomId)) {
      navigate('/home')
    }
  }, [activeProfile, roomId, navigate])

  if (!activeProfile || !roomId) return null

  const room = ROOMS.find((r) => r.id === roomId)
  if (!room) return null

  // ── Dispatch via registry ──────────────────────────────────────────────────
  const RoomComponent = ROOM_REGISTRY[roomId as RoomId]
  if (RoomComponent) {
    return <RoomComponent />
  }

  // ── Placeholder for rooms not yet built ───────────────────────────────────
  const roomStrings = s.rooms[roomId as RoomId]

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
        <span>{backArrow}</span>
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
          hairColor={profileColors.hair}
          outfitColor={profileColors.outfit}
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
