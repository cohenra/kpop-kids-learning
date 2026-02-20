import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── Animated spark counter ───────────────────────────────────────────────────

export function SparkCounter() {
  const { sparks } = useApp()
  const prevSparks = useRef(sparks)
  const [showBurst, setShowBurst] = useState(false)

  useEffect(() => {
    if (sparks > prevSparks.current) {
      setShowBurst(true)
      const t = setTimeout(() => setShowBurst(false), 800)
      prevSparks.current = sparks
      return () => clearTimeout(t)
    }
    prevSparks.current = sparks
  }, [sparks])

  return (
    <div className="relative flex items-center gap-1.5 bg-kpop-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-kpop-gold/30">
      <AnimatePresence>
        {showBurst && (
          <motion.div
            key="burst"
            className="absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <motion.span
        key={sparks}
        className="text-kpop-gold text-lg"
        initial={{ scale: 1.5, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        ✨
      </motion.span>

      <motion.span
        key={`count-${sparks}`}
        className="font-bold text-kpop-gold ltr-number"
        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', fontSize: '1.1rem' }}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {sparks}
      </motion.span>
    </div>
  )
}
