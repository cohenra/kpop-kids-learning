import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { BAND_MEMBERS } from '../../data/rewards'
import { MISSION_BONUS_SPARKS } from '../../data/dailyMissions'
import type { UseDailyMissionReturn } from '../../hooks/useDailyMission'

// ─── DailyMissionBanner ───────────────────────────────────────────────────────
//
// Shows the daily mission card on the Home screen.
//
// States:
//   active    → member emoji + mission text + progress dots + "play now" button
//   completed → gold banner with ✅ + "+50 ✨" reward tag
//
// The member avatar is shown in full color if the member is already unlocked,
// or as a silhouette (dark overlay) if still locked — giving an aspiration
// teaser without spoiling the surprise.

interface Props {
  missionData: UseDailyMissionReturn
}

const PROGRESS_LABELS_HE = ['📚 ספרי קריאה', '🔢 חדר מספרים', '🎵 חדר מוזיקה', '🧩 חדר חידות', '🌿 גן הטבע', '👨‍👩‍👧 חדר רגשות']
const ROOM_LABELS: Record<string, { he: string; en: string }> = {
  literacy: { he: '📚 ספרי קריאה',  en: '📚 Literacy'  },
  math:     { he: '🔢 חדר מספרים', en: '🔢 Math Room' },
  music:    { he: '🎵 מוזיקה',      en: '🎵 Music'     },
  logic:    { he: '🧩 חידות',       en: '🧩 Logic'     },
  social:   { he: '👨‍👩‍👧 רגשות',   en: '👨‍👩‍👧 Social' },
  nature:   { he: '🌿 טבע',         en: '🌿 Nature'   },
}

// Suppress unused warning — kept for future room label display
void PROGRESS_LABELS_HE

export function DailyMissionBanner({ missionData }: Props) {
  const { language, unlockedBandMembers } = useApp()
  const navigate = useNavigate()
  const { mission, gamesCompletedToday, gamesRequired, isCompleted } = missionData

  const isHe = language === 'he'
  const memberData = BAND_MEMBERS.find((m) => m.id === mission.memberId)
  const isMemberUnlocked = unlockedBandMembers.includes(mission.memberId)

  const missionText  = isHe ? mission.textHe  : mission.textEn
  const memberName   = isHe ? mission.memberNameHe : mission.memberNameEn
  const roomLabel    = ROOM_LABELS[mission.roomHint]
  const roomLabelStr = roomLabel ? (isHe ? roomLabel.he : roomLabel.en) : mission.roomHint

  // ── Completed state ──────────────────────────────────────────────────────
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 mb-3 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(234,179,8,0.15) 100%)',
          border: '1.5px solid rgba(245,158,11,0.5)',
          boxShadow: '0 0 20px rgba(245,158,11,0.25)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Completed avatar glow */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="text-3xl w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.2)', border: '1.5px solid rgba(245,158,11,0.4)' }}
          >
            {mission.emoji}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div
              className="font-bold text-kpop-gold text-sm leading-tight"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              {isHe ? '✅ המשימה הושלמה!' : '✅ Mission Complete!'}
            </div>
            <div className="text-white/60 text-xs mt-0.5">
              {isHe ? `${memberName} גאה בך! 🎉` : `${memberName} is proud of you! 🎉`}
            </div>
          </div>

          {/* Bonus tag */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: 'rgba(245,158,11,0.25)',
              border: '1px solid rgba(245,158,11,0.5)',
            }}
          >
            <span className="text-kpop-gold font-bold text-sm" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
              +{MISSION_BONUS_SPARKS}
            </span>
            <span className="text-base">✨</span>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // ── Active state ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      className="mx-4 mb-3 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(45,42,74,0.95) 100%)',
        border: '1.5px solid rgba(124,58,237,0.35)',
        boxShadow: '0 0 16px rgba(124,58,237,0.2)',
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Member avatar */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: isMemberUnlocked
                ? `linear-gradient(135deg, ${memberData?.hairColor ?? '#7C3AED'}55, ${memberData?.outfitColor ?? '#EC4899'}55)`
                : 'rgba(255,255,255,0.05)',
              border: `2px solid ${isMemberUnlocked ? (memberData?.hairColor ?? '#7C3AED') : 'rgba(255,255,255,0.1)'}`,
              filter: isMemberUnlocked ? 'none' : 'grayscale(1) brightness(0.4)',
            }}
          >
            {mission.emoji}
          </motion.div>
          {/* Pulsing dot */}
          <motion.div
            className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full"
            style={{ background: '#7C3AED' }}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-kpop-purple text-xs mb-0.5 uppercase tracking-wide"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {isHe ? '🎯 משימת היום' : '🎯 Daily Mission'}
          </div>
          <p
            className="text-white/80 text-xs leading-snug line-clamp-2"
            style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          >
            {missionText}
          </p>
        </div>
      </div>

      {/* Bottom row: progress + play button */}
      <div className="flex items-center justify-between px-4 pb-3 gap-3">
        {/* Progress dots + room hint */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: gamesRequired }).map((_, i) => (
              <motion.div
                key={i}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                animate={i < gamesCompletedToday
                  ? { scale: [1, 1.2, 1] }
                  : { scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  background: i < gamesCompletedToday
                    ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                    : 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${i < gamesCompletedToday ? '#7C3AED' : 'rgba(255,255,255,0.15)'}`,
                }}
              >
                {i < gamesCompletedToday ? '✓' : ''}
              </motion.div>
            ))}
            <span className="text-white/40 text-xs ms-1">
              {gamesCompletedToday}/{gamesRequired}
            </span>
          </div>
          <span className="text-white/30 text-[10px]">
            {roomLabelStr}
          </span>
        </div>

        {/* Play now button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => navigate(`/room/${mission.roomHint}`)}
          className="flex-shrink-0 px-4 py-2 rounded-xl font-bold text-white text-sm"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            boxShadow: '0 0 12px rgba(124,58,237,0.4)',
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            minWidth: 80,
          }}
        >
          {isHe ? 'בואי נשחק! ▶' : 'Play Now! ▶'}
        </motion.button>
      </div>
    </motion.div>
  )
}
