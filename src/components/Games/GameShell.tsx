import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { Character } from '../Character/Character'
import { t } from '../../i18n/strings'

// ─── GameShell: wrapper around every individual game ─────────────────────────
//
// Provides:
//  • Top bar with back button, game title, round counter
//  • Character (always visible, reacts to mood)
//  • Consistent dark background
//  • Children slot for game content

type CharMood = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging'

interface GameShellProps {
  title: string
  round: number
  totalRounds: number
  mood: CharMood
  onBack: () => void
  children: React.ReactNode
  hideCharacter?: boolean
}

export function GameShell({
  title,
  round,
  totalRounds,
  mood,
  onBack,
  children,
  hideCharacter = false,
}: GameShellProps) {
  const { language, isRTL, activeProfile } = useApp()
  const s = t(language)

  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899'

  const progressPct = totalRounds > 0 ? (round / totalRounds) * 100 : 0

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2 safe-top">
        <motion.button
          className="flex-shrink-0 flex items-center gap-1 text-white/60 font-bold
                     bg-kpop-card/60 px-3 py-2 rounded-full border border-white/10 text-base"
          whileTap={{ scale: 0.93 }}
          onClick={onBack}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          <span>{isRTL ? '→' : '←'}</span>
          {s.back}
        </motion.button>

        <div className="flex-1 min-w-0">
          <h2
            className="font-bold text-white text-lg truncate leading-tight"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {title}
          </h2>
          {/* Progress bar */}
          <div className="h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Round counter */}
        <div
          className="flex-shrink-0 flex flex-col items-center bg-kpop-card/80
                     rounded-2xl px-3 py-1 border border-white/10"
        >
          <span className="text-kpop-gold text-base font-bold ltr-number"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
            {round}/{totalRounds}
          </span>
          <span className="text-white/40 text-xs">
            {isRTL ? 'סיבוב' : 'round'}
          </span>
        </div>
      </div>

      {/* ── Character sidebar ─────────────────────────────────────────── */}
      {!hideCharacter && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            bottom: 80,
            [isRTL ? 'left' : 'right']: -10,
          }}
        >
          <Character
            mood={mood}
            size={90}
            hairColor={hairColor}
            outfitColor={outfitColor}
          />
        </div>
      )}

      {/* ── Game content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}
