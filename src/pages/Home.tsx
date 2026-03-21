import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Character } from '../components/Character/Character'
import { SparkCounter } from '../components/UI/SparkCounter'
import { StarParticles } from '../components/UI/StarParticles'
import { DailyMissionBanner } from '../components/DailyMission/DailyMissionBanner'
import { t } from '../i18n/strings'
import { ROOMS } from '../data/games'
import { BAND_MEMBERS } from '../data/rewards'
import { speak } from '../utils/tts'
import { useDailyMissions } from '../hooks/useDailyMission'
import type { RoomId } from '../data/games'

// ─── Home screen ──────────────────────────────────────────────────────────────

const LOGO_HOLD_MS = 3000

// ── Spark rain: floating ✨ particles that burst when sparks increase ──────────
interface SparkParticle {
  id: number
  x: number
  y: number
}

let _particleId = 0

function SparkRain({ particles }: { particles: SparkParticle[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute text-2xl select-none"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 1, scale: 0.5, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -120 + Math.random() * -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            ✨
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function Home() {
  const navigate = useNavigate()
  const {
    activeProfile,
    activeProfileId,
    language,
    setLanguage,
    profileColors,
    sparks,
    unlockedBandMembers,
    outfit,
  } = useApp()
  const s = t(language)
  const isHe = language === 'he'

  // Daily missions
  const missionData = useDailyMissions()

  // Logo hold for Parent Mode
  const logoHoldTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [logoHolding, setLogoHolding]   = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)

  // Spark rain
  const [sparkParticles, setSparkParticles] = useState<SparkParticle[]>([])
  const prevSparksRef = useRef(sparks)

  // Daily greeting (fires once per new day, on mount)
  const greetingFiredRef = useRef(false)

  // ── Guard: redirect to welcome if no profile ──────────────────────────────
  useEffect(() => {
    if (!activeProfile) navigate('/')
  }, [activeProfile, navigate])

  // ── Daily greeting TTS ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeProfile || greetingFiredRef.current) return
    if (!missionData.isNewDay) return
    greetingFiredRef.current = true

    const firstMission = missionData.missions[0]?.mission
    const timer = setTimeout(() => {
      const name = activeProfile.characterName
      const text = isHe
        ? `היי ${name}! ${firstMission?.ttsHe ?? ''}`
        : `Hey ${name}! ${firstMission?.ttsEn ?? ''}`
      speak(text, language)
    }, 800)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfile?.id, missionData.isNewDay])

  // ── Spark rain: burst ✨ when sparks increase ──────────────────────────────
  useEffect(() => {
    if (sparks > prevSparksRef.current) {
      const gained = sparks - prevSparksRef.current
      const count  = Math.min(Math.ceil(gained / 5), 18)
      const newParticles: SparkParticle[] = Array.from({ length: count }, () => ({
        id: ++_particleId,
        x: 60 + Math.random() * (window.innerWidth - 120),
        y: 80 + Math.random() * (window.innerHeight * 0.4),
      }))
      setSparkParticles((prev) => [...prev, ...newParticles])
      setTimeout(() => {
        setSparkParticles((prev) =>
          prev.filter((p) => !newParticles.find((n) => n.id === p.id))
        )
      }, 1600)
    }
    prevSparksRef.current = sparks
  }, [sparks])

  // ── Room navigation ────────────────────────────────────────────────────────
  const handleRoomTap = useCallback((room: { id: RoomId; available: boolean }) => {
    if (!room.available) return
    navigate(`/room/${room.id}`)
  }, [navigate])

  // ── Logo hold ──────────────────────────────────────────────────────────────
  const startLogoHold = () => {
    setLogoHolding(true)
    setLogoProgress(0)
    const start = Date.now()
    progressInterval.current = setInterval(() => {
      setLogoProgress(Math.min(100, ((Date.now() - start) / LOGO_HOLD_MS) * 100))
    }, 50)
    logoHoldTimer.current = setTimeout(() => {
      clearInterval(progressInterval.current!)
      setLogoHolding(false)
      setLogoProgress(0)
      navigate('/parent')
    }, LOGO_HOLD_MS)
  }

  const cancelLogoHold = () => {
    if (logoHoldTimer.current)  clearTimeout(logoHoldTimer.current)
    if (progressInterval.current) clearInterval(progressInterval.current)
    setLogoHolding(false)
    setLogoProgress(0)
  }

  // ── Next locked member teaser ──────────────────────────────────────────────
  const nextLockedMember = BAND_MEMBERS.find(
    (m) => !unlockedBandMembers.includes(m.id)
  )

  if (!activeProfile) return null

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #16142A 100%)' }}
    >
      <StarParticles />
      <SparkRain particles={sparkParticles} />

      {/* ── Top bar (fixed) ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 safe-top flex-shrink-0">
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
            {logoHolding && (
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
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
          <span className="text-white/50 text-base">{s.homeGreeting}</span>
          <span
            className="text-white font-bold text-lg"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {activeProfile.characterName}
          </span>
          <span className="text-xl">{activeProfileId === 1 ? '👑' : '✨'}</span>
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

      {/* ── Scrollable content ────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollable px-4 pb-2">

        {/* ── Character (tap to open Outfit Studio) ──────────────────────── */}
        <div className="flex flex-col items-center pt-1 pb-0">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/outfit')}
            className="relative"
            aria-label={isHe ? 'סטודיו לבוש' : 'Outfit Studio'}
          >
            <Character
              mood="idle"
              size={100}
              hairColor={profileColors.hair}
              outfitColor={profileColors.outfit}
              ribbonColor={profileColors.hair}
              hairAccessory={outfit.hairAccessory}
            />
            {/* Customize badge */}
            <motion.div
              className="absolute bottom-3 end-0 w-7 h-7 rounded-full
                         flex items-center justify-center text-sm shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                boxShadow: '0 0 10px rgba(124,58,237,0.5)',
              }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              🎨
            </motion.div>
          </motion.button>
        </div>

        {/* ── Daily Mission Banners ────────────────────────────────────────── */}
        <DailyMissionBanner missionData={missionData} />

        {/* ── Game Rooms section ───────────────────────────────────────────── */}
        <div>
          {/* Section header */}
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
              {isHe ? '🎮 חדרי המשחקים' : '🎮 Game Rooms'}
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

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
                    'min-h-[110px] border border-white/10',
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

                  <span className="text-4xl leading-none">{room.emoji}</span>

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

                  {isLocked && (
                    <div className="absolute top-2 end-2 text-white/30 text-lg">🔒</div>
                  )}
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
      </div>

      {/* ── Bottom fixed area ──────────────────────────────────────────────── */}
      <div className="relative z-10 px-4 pb-4 safe-bottom flex flex-col gap-2 flex-shrink-0">
        {/* Next-member teaser */}
        {nextLockedMember && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/stage')}
            className="w-full rounded-xl py-2.5 px-4 flex items-center gap-3
                       border border-white/10"
            style={{ background: 'rgba(45,42,74,0.7)' }}
          >
            {/* Silhouette avatar */}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: 'rgba(255,255,255,0.06)',
                filter: 'grayscale(1) brightness(0.35)',
                border: '1.5px solid rgba(255,255,255,0.12)',
              }}
            >
              {nextLockedMember.emoji}
            </motion.div>

            <div className="flex-1 text-start">
              <div
                className="text-white/50 text-xs font-bold uppercase tracking-wide"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isHe ? '🔒 חברת הלהקה הבאה' : '🔒 Next Band Member'}
              </div>
              <div className="text-white/30 text-[11px] mt-0.5">
                {isHe
                  ? 'המשיכי לשחק כדי לגלות מי היא!'
                  : 'Keep playing to reveal who she is!'}
              </div>
            </div>

            <div className="text-white/25 text-lg flex-shrink-0">
              {isHe ? '←' : '→'}
            </div>
          </motion.button>
        )}

        {/* My Stage button */}
        <motion.button
          className="w-full rounded-2xl py-3.5 font-bold text-white text-xl
                     flex items-center justify-center gap-2 border border-kpop-gold/30"
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(236,72,153,0.25) 100%)',
            boxShadow: '0 0 20px rgba(245,158,11,0.2)',
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            minHeight: 60,
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
