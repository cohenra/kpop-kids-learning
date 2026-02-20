import React from 'react'
import { motion } from 'framer-motion'

// ─── Reusable button component ────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'cyan' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  className?: string
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-kpop-purple to-kpop-pink text-white border-none',
  secondary: 'bg-kpop-card text-kpop-text border border-kpop-purple/40',
  gold: 'bg-gradient-to-r from-kpop-gold to-amber-400 text-kpop-bg border-none',
  cyan: 'bg-gradient-to-r from-kpop-cyan to-blue-400 text-white border-none',
  ghost: 'bg-transparent text-kpop-text border border-white/20',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-base min-h-[48px] min-w-[48px]',
  md: 'px-6 py-3 text-lg min-h-[60px] min-w-[60px]',
  lg: 'px-8 py-4 text-xl min-h-[72px] min-w-[72px]',
  xl: 'px-10 py-5 text-2xl min-h-[80px] min-w-[80px]',
}

const glowStyles: Record<ButtonVariant, string> = {
  primary: 'shadow-[0_0_20px_rgba(124,58,237,0.5)]',
  secondary: 'shadow-none',
  gold: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  cyan: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
  ghost: 'shadow-none',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.93 }}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={[
        'rounded-2xl font-bold cursor-pointer transition-all duration-200',
        'select-none touch-manipulation',
        variantStyles[variant],
        sizeStyles[size],
        glowStyles[variant],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
    >
      {children}
    </motion.button>
  )
}
