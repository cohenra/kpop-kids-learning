import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { useAudio } from '../../hooks/useAudio'
import { Character } from '../Character/Character'
import type { BandMember } from '../../data/rewards'

// ─── Bandmate Celebration Overlay ─────────────────────────────────────────────
//
// Full-screen celebration when a new bandmate is unlocked.
// Shows the new member sliding in with sparkles + TTS greeting.
// Dismissed by tapping "Say hi! 👋"

interface Props {
  member: BandMember
}

export function BandmateCelebration({ member }: Props) {
  const { language, isRTL, dismissBandmate } = useApp()
  const { say } = useAudio()

  const nameDisplay = language === 'he' ? member.nameHe : member.nameEn
  const roleDisplay = language === 'he' ? member.roleHe : member.roleEn

  // TTS greeting when overlay appears
  useEffect(() => {
    const msg = language === 'he'
      ? `יש לך חברה חדשה! זאת ${member.nameHe}, ${member.roleHe}!`
      : `You have a new friend! This is ${member.nameEn}, the ${member.roleEn}!`
    const timer = setTimeout(() => say(msg), 600)
    return () => clearTimeout(timer)
  }, [member, language, say])

  // Role → color mapping for accent
  const roleColor = {
    vocalist: '#EC4899',
    dancer:   '#06B6D4',
    rapper:   '#F59E0B',
    dj:       '#7C3AED',
    visual:   '#10B981',
    maknae:   '#EC4899',
  }[member.role] ?? '#EC4899'

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'rgba(13,11,26,0.97)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${roleColor}30 0%, transparent 70%)`,
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />

      {/* Starburst particles */}
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.5, 0.8],
            x: Math.cos((i / 14) * Math.PI * 2) * 140,
            y: Math.sin((i / 14) * Math.PI * 2) * 160,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.1, delay: i * 0.05, ease: 'easeOut' }}
        >
          {['✨', '⭐', '💫', '🌟', '✦', '🎵', '🎤', '💃', '👑', '🎶', '🌟', '💫', '⭐', '✨'][i]}
        </motion.span>
      ))}

      {/* Main card content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 px-8 text-center"
        initial={{ opacity: 0, y: 60, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* "New Member!" badge */}
        <motion.div
          className="px-5 py-1.5 rounded-full font-bold text-sm"
          style={{
            background: `linear-gradient(135deg, ${roleColor}, #7C3AED)`,
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            color: 'white',
            boxShadow: `0 0 20px ${roleColor}88`,
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {isRTL ? '🎉 חברה חדשה ללהקה!' : '🎉 New Group Member!'}
        </motion.div>

        {/* Character slide-in */}
        <motion.div
          initial={{ x: isRTL ? -120 : 120, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 14 }}
        >
          <Character
            mood="excited"
            size={150}
            hairColor={member.hairColor}
            outfitColor={member.outfitColor}
          />
        </motion.div>

        {/* Member name */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <h1
            className="text-5xl font-bold"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              background: `linear-gradient(135deg, ${roleColor}, #F9FAFB)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {member.emoji} {nameDisplay}
          </h1>
          <p
            className="text-white/60 text-xl font-bold"
            style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          >
            {roleDisplay}
          </p>
        </motion.div>

        {/* Greeting message */}
        <motion.p
          className="text-white/70 text-lg max-w-xs"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          {isRTL
            ? `${member.nameHe} הצטרפה ללהקה שלך! 🌟`
            : `${member.nameEn} has joined your group! 🌟`}
        </motion.p>

        {/* Dismiss button */}
        <motion.button
          className="mt-2 rounded-3xl px-10 py-4 font-bold text-white text-2xl
                     border-2 border-white/20"
          style={{
            background: `linear-gradient(135deg, ${roleColor}, #7C3AED)`,
            boxShadow: `0 0 30px ${roleColor}66`,
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            minHeight: 72,
            minWidth: 200,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, type: 'spring', stiffness: 300 }}
          whileTap={{ scale: 0.93 }}
          onClick={dismissBandmate}
        >
          {isRTL ? 'שלום! 👋' : 'Say hi! 👋'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── AnimatePresence wrapper — plug this into App.tsx ─────────────────────────

export function BandmateCelebrationLayer() {
  const { newlyUnlockedBandmate } = useApp()
  return (
    <AnimatePresence>
      {newlyUnlockedBandmate && (
        <BandmateCelebration key={newlyUnlockedBandmate.id} member={newlyUnlockedBandmate} />
      )}
    </AnimatePresence>
  )
}
