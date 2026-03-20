import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Character } from '../components/Character/Character'
import { SparkCounter } from '../components/UI/SparkCounter'
import { StarParticles } from '../components/UI/StarParticles'
import { t } from '../i18n/strings'
import { ROOMS } from '../data/games'
import type { RoomId } from '../data/games'

// ─── Home screen ──────────────────────────────────────────────────────────────

const LOGO_HOLD_MS = 3000

export function Home() {
  const navigate = useNavigate()
  const { activeProfile, language, setLanguage, profileColors } = useApp()
  const s = t(language)

  const logoHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [logoHolding, setLogoHolding] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // If no profile, redirect to welcome (in effect — not during render)
  useEffect(() => {
    if (!activeProfile) navigate('/')
  }, [activeProfile, navigate])

  const handleRoomTap = (room: { id: RoomId; available: boolean }) => {
    if (!room.available) return
    navigate(`/room/${room.id}`)
  }

  // Logo hold for Parent Mode
  const startLogoHold = () => {
    setLogoHolding(true)
    setLogoProgress(0)

    const start = Date.now()
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - start
      setLogoProgress(Math.min(100, (elapsed / LOGO_HOLD_MS) * 100))
    }, 50)

    logoHoldTimer.current = setTimeout(() => {
      clearInterval(progressInterval.current!)
      setLogoHolding(false)
      setLogoProgress(0)
      navigate('/parent')
    }, LOGO_HOLD_MS)
  }

  const cancelLogoHold = () => {
    if (logoHoldTimer.current) clearTimeout(logoHoldTimer.current)
    if (progressInterval.current) clearInterval(progressInterval.current)
    setLogoHolding(false)
    setLogoProgress(0)
  }

  if (!activeProfile) return null

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #16142A 100%)' }}
    >
      <StarParticles />

      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        {/* Logo (hold for parent mode) */}
        <div className="relative">
          <motion.button
            className="relative w-12 h-12 flex items-center justify-center
                       rounded-full bg-kpop-card/80 border border-kpop-purple/30
                       text-2xl overflow-hidden"
            onPointerDown={startLogoHold}
            onPointerUp={cancelLogoHold}
            onPointerLeave={cancelLogoHold}
            whileTap={{ scale: 0.9 }}
          >
            🌟
            {/* Progress ring */}
            {logoHolding && (
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24" cy="24" r="21"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3"
                  strokeDasharray={`${(2 * Math.PI * 21 * logoProgress) / 100} 999`}
                  strokeLinecap="round"
                />
              </svg>
            )}
          </motion.button>
        </div>

        {/* Profile name */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-white/50 text-base">
            {s.homeGreeting}
          </span>
          <span
            className="text-white font-bold text-lg"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {activeProfile.characterName}
          </span>
          <span className="text-xl">
            {activeProfile.id === 1 ? '👑' : '✨'}
          </span>
        </motion.div>

        {/* Spark counter + lang toggle */}
        <div className="flex items-center gap-2">
          <SparkCounter />
          <motion.button
            className="bg-kpop-card/80 px-3 py-1.5 rounded-full text-kpop-cyan
                       font-bold border border-kpop-cyan/30 text-sm"
            whileTap={{ scale: 0.9 }}
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {s.langToggle}
          </motion.button>
        </div>
      </div>

      {/* ── Character + greeting ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center pt-1 pb-0 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Character
            mood="idle"
            size={130}
            hairColor={profileColors.hair}
            outfitColor={profileColors.outfit}
          />
        </motion.div>
      </div>

      {/* ── Room grid ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollable px-4 pb-2">
        <div className="grid grid-cols-2 gap-3 pb-2">
          {ROOMS.map((room, i) => {
            const roomStrings = s.rooms[room.id]
            const isLocked = !room.available

            return (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 200 }}
                whileTap={!isLocked ? { scale: 0.94 } : undefined}
                whileHover={!isLocked ? { scale: 1.03 } : undefined}
                onClick={() => handleRoomTap(room)}
                className={[
                  'relative rounded-3xl p-4 text-start overflow-hidden',
                  'min-h-[120px] border border-white/10',
                  'flex flex-col justify-between',
                  isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                style={{
                  background: isLocked
                    ? 'rgba(45,42,74,0.6)'
                    : `linear-gradient(135deg, ${room.color}33 0%, rgba(45,42,74,0.9) 100%)`,
                  boxShadow: isLocked ? 'none' : `0 0 20px ${room.glowColor}`,
                }}
              >
                {/* Glow spot */}
                {!isLocked && (
                  <div
                    className="absolute top-0 end-0 w-16 h-16 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background: room.color,
                      filter: 'blur(16px)',
                      transform: 'translate(40%, -40%)',
                    }}
                  />
                )}

                {/* Emoji icon */}
                <span className="text-4xl leading-none">{room.emoji}</span>

                {/* Room name */}
                <div>
                  <h3
                    className="font-bold text-white leading-tight text-base"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                  >
                    {roomStrings.name}
                  </h3>
                  {isLocked ? (
                    <p className="text-white/40 text-xs mt-0.5">{s.comingSoon}</p>
                  ) : (
                    <p
                      className="text-white/50 text-xs mt-0.5 leading-snug"
                      style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                    >
                      {roomStrings.tagline}
                    </p>
                  )}
                </div>

                {/* Lock badge */}
                {isLocked && (
                  <div className="absolute top-2 end-2 text-white/30 text-lg">🔒</div>
                )}

                {/* Available badge */}
                {!isLocked && (
                  <motion.div
                    className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full"
                    style={{ background: room.color }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Bottom: My Stage button ─────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-4 safe-bottom">
        <motion.button
          className="w-full rounded-2xl py-4 font-bold text-white text-xl
                     flex items-center justify-center gap-2 border border-kpop-gold/30"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(236,72,153,0.25) 100%)',
            boxShadow: '0 0 20px rgba(245,158,11,0.2)',
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            minHeight: 64,
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/stage')}
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            🎭
          </motion.span>
          {s.myStage}
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-kpop-gold"
          >
            ✨
          </motion.span>
        </motion.button>
      </div>
    </div>
  )
}
