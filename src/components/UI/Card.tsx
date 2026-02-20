import React from 'react'
import { motion } from 'framer-motion'

// ─── Reusable card component ──────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  glowColor?: string
  onClick?: () => void
  animated?: boolean
  delay?: number
}

export function Card({
  children,
  className = '',
  glow = false,
  glowColor = 'rgba(124,58,237,0.4)',
  onClick,
  animated = true,
  delay = 0,
}: CardProps) {
  const glowStyle = glow
    ? { boxShadow: `0 0 25px ${glowColor}, 0 4px 20px rgba(0,0,0,0.3)` }
    : { boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }

  const base = (
    <div
      onClick={onClick}
      className={[
        'bg-kpop-card rounded-3xl p-4',
        'border border-white/10',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={glowStyle}
    >
      {children}
    </div>
  )

  if (!animated) return base

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      className={[
        'bg-kpop-card rounded-3xl p-4',
        'border border-white/10',
        onClick ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={glowStyle}
    >
      {children}
    </motion.div>
  )
}
