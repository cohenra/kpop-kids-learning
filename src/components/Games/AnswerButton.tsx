import { motion } from 'framer-motion'
import type { AgeProfile } from '../../utils/storage'

// ─── Reusable answer choice button ───────────────────────────────────────────
// Used in Letter Recognition, Word Completion, etc.

interface AnswerButtonProps {
  label: string
  sublabel?: string
  emoji?: string
  onClick: () => void
  state?: 'default' | 'correct' | 'wrong' | 'disabled'
  age?: AgeProfile
  index?: number
}

const stateStyles = {
  default:  'bg-kpop-card border-white/20 text-white',
  correct:  'bg-kpop-purple/50 border-kpop-gold text-white shadow-[0_0_20px_rgba(245,158,11,0.6)]',
  wrong:    'bg-red-500/10 border-red-400/40 text-white/60',
  disabled: 'bg-kpop-card/40 border-white/10 text-white/30',
}

export function AnswerButton({
  label,
  sublabel,
  emoji,
  onClick,
  state = 'default',
  age = 5,
  index = 0,
}: AnswerButtonProps) {
  const minSize = age === 3 ? 'min-h-[80px]' : 'min-h-[68px]'
  const isInteractive = state === 'default'
  // Font size scales with label length
  const fontSize = label.length > 3 ? 'text-2xl' : label.length > 1 ? 'text-3xl' : 'text-5xl'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300 }}
      whileTap={isInteractive ? { scale: 0.93 } : undefined}
      whileHover={isInteractive ? { scale: 1.04, y: -2 } : undefined}
      onClick={isInteractive ? onClick : undefined}
      className={[
        'relative flex flex-col items-center justify-center gap-1',
        'rounded-3xl border-2 p-3 w-full',
        'transition-all duration-200',
        'select-none touch-manipulation',
        minSize,
        stateStyles[state],
        isInteractive ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
      style={{
        fontFamily: 'Fredoka One, Nunito, sans-serif',
        boxShadow: state === 'correct'
          ? '0 0 25px rgba(245,158,11,0.5), 0 4px 15px rgba(0,0,0,0.3)'
          : '0 4px 15px rgba(0,0,0,0.2)',
      }}
    >
      {/* Correct check mark */}
      {state === 'correct' && (
        <motion.div
          className="absolute top-1.5 end-2 text-kpop-gold text-xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 0] }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          ✓
        </motion.div>
      )}

      {emoji && (
        <span className="text-3xl leading-none">{emoji}</span>
      )}

      <span className={`font-bold leading-tight text-center ${fontSize}`}>
        {label}
      </span>

      {sublabel && (
        <span className="text-white/50 text-sm text-center leading-tight"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
          {sublabel}
        </span>
      )}
    </motion.button>
  )
}
