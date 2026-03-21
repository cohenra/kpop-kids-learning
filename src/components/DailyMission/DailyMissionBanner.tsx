import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { BAND_MEMBERS } from '../../data/rewards'
import { MISSION_BONUS_SPARKS } from '../../data/dailyMissions'
import type { UseDailyMissionsReturn, SingleMissionProgress } from '../../hooks/useDailyMission'

// ─── DailyMissionBanner ───────────────────────────────────────────────────────
//
// Shows 3 daily mission cards in a compact vertical stack on the Home screen.
//
// Each card:
//   active    → member emoji + short text + 2 progress dots + play button
//   completed → gold ✅ state

const ROOM_LABELS: Record<string, { he: string; en: string }> = {
  literacy: { he: '📚 ספרי קריאה',  en: '📚 Literacy'  },
  math:     { he: '🔢 חדר מספרים', en: '🔢 Math Room' },
  music:    { he: '🎵 מוזיקה',      en: '🎵 Music'     },
  logic:    { he: '🧩 חידות',       en: '🧩 Logic'     },
  social:   { he: '👨‍👩‍👧 רגשות',   en: '👨‍👩‍👧 Social' },
  nature:   { he: '🌿 טבע',         en: '🌿 Nature'   },
}

interface Props {
  missionData: UseDailyMissionsReturn
}

export function DailyMissionBanner({ missionData }: Props) {
  const { language, unlockedBandMembers } = useApp()
  const navigate = useNavigate()
  const { missions } = missionData
  const isHe = language === 'he'

  return (
    <div className="mx-4 mb-2 flex flex-col gap-1.5">
      {missions.map((mp, i) => (
        <MissionCard
          key={mp.mission.id + i}
          mp={mp}
          isHe={isHe}
          unlockedBandMembers={unlockedBandMembers}
          onPlay={() => navigate(`/room/${mp.mission.roomHint}`)}
          delay={i * 0.07}
        />
      ))}
    </div>
  )
}

// ─── Single mission card ───────────────────────────────────────────────────────

interface MissionCardProps {
  mp: SingleMissionProgress
  isHe: boolean
  unlockedBandMembers: string[]
  onPlay: () => void
  delay: number
}

function MissionCard({ mp, isHe, unlockedBandMembers, onPlay, delay }: MissionCardProps) {
  const { mission, gamesCompletedToday, gamesRequired, isCompleted } = mp

  const memberData = BAND_MEMBERS.find((m) => m.id === mission.memberId)
  const isMemberUnlocked = unlockedBandMembers.includes(mission.memberId)
  const memberName = isHe ? mission.memberNameHe : mission.memberNameEn
  const roomLabel = ROOM_LABELS[mission.roomHint]
  const roomLabelStr = roomLabel ? (isHe ? roomLabel.he : roomLabel.en) : mission.roomHint

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(234,179,8,0.1) 100%)',
          border: '1px solid rgba(245,158,11,0.4)',
          boxShadow: '0 0 12px rgba(245,158,11,0.15)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-xl w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.18)' }}
        >
          {mission.emoji}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-kpop-gold text-xs leading-tight"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            ✅ {isHe ? 'הושלמה!' : 'Done!'}
          </div>
          <div className="text-white/50 text-[10px]">
            {isHe ? `${memberName} גאה בך` : `${memberName} is proud`}
          </div>
        </div>

        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-0.5 px-2 py-1 rounded-full flex-shrink-0"
          style={{
            background: 'rgba(245,158,11,0.2)',
            border: '1px solid rgba(245,158,11,0.45)',
          }}
        >
          <span
            className="text-kpop-gold font-bold text-xs"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            +{MISSION_BONUS_SPARKS}
          </span>
          <span className="text-sm">✨</span>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 220 }}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(45,42,74,0.9) 100%)',
        border: '1px solid rgba(124,58,237,0.28)',
        boxShadow: '0 0 10px rgba(124,58,237,0.12)',
      }}
    >
      {/* Member avatar */}
      <div className="relative flex-shrink-0">
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.4 }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-xl"
          style={{
            background: isMemberUnlocked
              ? `linear-gradient(135deg, ${memberData?.hairColor ?? '#7C3AED'}44, ${memberData?.outfitColor ?? '#EC4899'}44)`
              : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${isMemberUnlocked ? (memberData?.hairColor ?? '#7C3AED') : 'rgba(255,255,255,0.1)'}`,
            filter: isMemberUnlocked ? 'none' : 'grayscale(1) brightness(0.4)',
          }}
        >
          {mission.emoji}
        </motion.div>
        {/* Pulsing dot */}
        <motion.div
          className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 rounded-full"
          style={{ background: '#7C3AED' }}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* Text + progress dots */}
      <div className="flex-1 min-w-0">
        <p
          className="text-white/75 text-[11px] leading-tight line-clamp-1 mb-0.5"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        >
          {isHe ? mission.textHe : mission.textEn}
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: gamesRequired }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
              style={{
                background: i < gamesCompletedToday
                  ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                  : 'rgba(255,255,255,0.1)',
                border: `1px solid ${i < gamesCompletedToday ? '#7C3AED' : 'rgba(255,255,255,0.15)'}`,
              }}
            >
              {i < gamesCompletedToday ? '✓' : ''}
            </div>
          ))}
          <span className="text-white/30 text-[9px] ms-0.5">
            {roomLabelStr}
          </span>
        </div>
      </div>

      {/* Play button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={onPlay}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-white text-xs"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
          boxShadow: '0 0 10px rgba(124,58,237,0.35)',
          fontFamily: 'Fredoka One, Nunito, sans-serif',
          minWidth: 60,
        }}
      >
        {isHe ? 'שחקי ▶' : 'Play ▶'}
      </motion.button>
    </motion.div>
  )
}
