import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── Celebration overlay for correct answers ──────────────────────────────────

interface CelebrationOverlayProps {
  show: boolean
  message: string
  sparksEarned?: number
}

const BURST_EMOJIS = ['✨', '⭐', '💫', '🌟', '✦', '★', '🎉', '💥']

export function CelebrationOverlay({ show, message, sparksEarned }: CelebrationOverlayProps) {
  const { isRTL } = useApp()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="celebration"
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Radial glow */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'radial-gradient(circle at center, rgba(245,158,11,0.5) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)',
            }}
          />

          {/* Burst particles */}
          {BURST_EMOJIS.map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / BURST_EMOJIS.length) * Math.PI * 2) * 140,
                y: Math.sin((i / BURST_EMOJIS.length) * Math.PI * 2) * 120,
                scale: [0, 1.5, 0.8],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.7, delay: i * 0.04, ease: 'easeOut' }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Central message */}
          <motion.div
            className="flex flex-col items-center gap-2 text-center px-6"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          >
            <div
              className="text-5xl font-bold"
              style={{
                fontFamily: 'Fredoka One, Nunito, sans-serif',
                background: 'linear-gradient(135deg, #F59E0B, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 15px rgba(245,158,11,0.6))',
              }}
            >
              {message}
            </div>

            {sparksEarned !== undefined && sparksEarned > 0 && (
              <motion.div
                className="flex items-center gap-1.5 bg-kpop-card/90 rounded-full px-4 py-2
                           border border-kpop-gold/40"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-xl"
                >✨</motion.span>
                <span
                  className="text-kpop-gold font-bold text-xl ltr-number"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  +{sparksEarned}
                </span>
                <span className="text-white/60 text-base">
                  {isRTL ? 'ניצוצות!' : 'sparks!'}
                </span>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
