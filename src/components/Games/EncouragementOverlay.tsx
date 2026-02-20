import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── Gentle encouragement overlay for wrong answers ───────────────────────────
// NO red X, NO scary sounds, always positive

interface EncouragementOverlayProps {
  show: boolean
  message: string
}

export function EncouragementOverlay({ show, message }: EncouragementOverlayProps) {
  const { isRTL } = useApp()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="encouragement"
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Soft purple glow — gentle, not alarming */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0] }}
            transition={{ duration: 0.7 }}
            style={{
              background: 'radial-gradient(circle at center, rgba(124,58,237,0.3) 0%, transparent 60%)',
            }}
          />

          {/* Message bubble */}
          <motion.div
            className="flex flex-col items-center gap-2 text-center px-8"
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Gentle shake emoji */}
            <motion.div
              className="text-5xl"
              animate={{ rotate: [-8, 8, -5, 5, 0] }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              💪
            </motion.div>

            <div
              className="text-3xl font-bold text-kpop-cyan"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              {message}
            </div>

            <p
              className="text-white/60 text-lg"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
            >
              {isRTL ? 'נסי שוב — את יכולה! 🌟' : "Try again — you've got this! 🌟"}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
