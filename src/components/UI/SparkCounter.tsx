import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'

// ─── Animated star spark counter — glowing gold badge ─────────────────────────

export function SparkCounter() {
  const { sparks } = useApp()
  const prevSparks = useRef(sparks)
  const [showBurst, setShowBurst] = useState(false)
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    if (sparks > prevSparks.current) {
      setShowBurst(true)
      // Spawn 6 gold particles
      setParticles([...Array(6)].map((_, i) => i))
      const t1 = setTimeout(() => setShowBurst(false), 900)
      const t2 = setTimeout(() => setParticles([]), 700)
      prevSparks.current = sparks
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
    prevSparks.current = sparks
  }, [sparks])

  return (
    <motion.div
      className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 border border-kpop-gold/40"
      style={{
        background: 'linear-gradient(135deg, rgba(45,42,74,0.9), rgba(30,27,46,0.95))',
        backdropFilter: 'blur(8px)',
        boxShadow: showBurst
          ? '0 0 20px rgba(245,158,11,0.7), 0 0 40px rgba(245,158,11,0.4)'
          : '0 0 10px rgba(245,158,11,0.2)',
      }}
      animate={{ scale: showBurst ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Radial burst on earn */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            key="burst"
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.7) 0%, transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Flying particles */}
      <AnimatePresence>
        {particles.map((i) => (
          <motion.span
            key={`p-${i}`}
            className="absolute text-sm pointer-events-none"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: 0, y: 0, scale: 0.5, opacity: 1 }}
            animate={{
              x: (Math.cos((i / 6) * Math.PI * 2) * 28),
              y: (Math.sin((i / 6) * Math.PI * 2) * 24),
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Golden star icon with rays */}
      <motion.div
        className="relative"
        key={showBurst ? 'burst' : 'idle'}
        animate={showBurst
          ? { rotate: [0, -15, 15, -10, 0], scale: [1, 1.3, 1] }
          : { rotate: 0, scale: 1 }
        }
        transition={{ duration: 0.45 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Sparkle rays */}
          <line x1="12" y1="1" x2="12" y2="4" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="20" x2="12" y2="23" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="12" x2="4" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="12" x2="23" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="4" x2="6.2" y2="6.2" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="17.8" y1="17.8" x2="20" y2="20" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="20" y1="4" x2="17.8" y2="6.2" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="4" y1="20" x2="6.2" y2="17.8" stroke="#F59E0B" strokeWidth="1.3" strokeLinecap="round" />
          {/* Star shape */}
          <path
            d="M12 5l1.8 4.4 4.7 0.4-3.5 3.2 1 4.6L12 15.3l-4 2.3 1-4.6L5.5 9.8l4.7-0.4z"
            fill="#F59E0B"
            stroke="#FBBF24"
            strokeWidth="0.5"
          />
          {/* Star highlight */}
          <path d="M12 7l1 2.5 2.7 0.2-2 1.8 0.6 2.6L12 12.8l-2.3 1.3 0.6-2.6-2-1.8 2.7-0.2z"
            fill="#FDE68A" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Animated number */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={sparks}
          className="font-bold text-kpop-gold ltr-number"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', fontSize: '1.1rem', minWidth: '1.8rem', textAlign: 'center' }}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          {sparks}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
