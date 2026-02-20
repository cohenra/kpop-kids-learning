import { motion } from 'framer-motion'

// ─── K-POP character SVG avatar with emotion states ──────────────────────────

type Mood = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging'

interface CharacterProps {
  mood?: Mood
  name?: string
  size?: number
  hairColor?: string
  outfitColor?: string
  showName?: boolean
}

export function Character({
  mood = 'idle',
  name,
  size = 160,
  hairColor = '#EC4899',
  outfitColor = '#7C3AED',
  showName = false,
}: CharacterProps) {
  // Eye expressions per mood
  const eyeVariants: Record<Mood, { scaleY: number; y: number }> = {
    idle:        { scaleY: 1,    y: 0 },
    happy:       { scaleY: 0.4,  y: 1 },
    excited:     { scaleY: 1.2,  y: -1 },
    thinking:    { scaleY: 0.8,  y: 0 },
    encouraging: { scaleY: 0.5,  y: 1 },
  }

  // Mouth shape per mood (simplified as arc)
  const mouthPaths: Record<Mood, string> = {
    idle:        'M 40 68 Q 50 74 60 68',
    happy:       'M 37 66 Q 50 78 63 66',
    excited:     'M 35 65 Q 50 82 65 65',
    thinking:    'M 40 70 Q 50 70 60 70',
    encouraging: 'M 38 67 Q 50 76 62 67',
  }

  const bounceAnimation = mood === 'idle'
    ? { y: [0, -6, 0] }
    : mood === 'happy' || mood === 'excited'
    ? { y: [0, -12, 0, -8, 0], rotate: [-3, 3, -3, 3, 0] }
    : { y: [0, -4, 0] }

  const bounceDuration = mood === 'excited' ? 0.6 : 2

  // Sparkles for happy/excited
  const showSparkles = mood === 'happy' || mood === 'excited'

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={bounceAnimation}
        transition={{
          duration: bounceDuration,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
        style={{ width: size, height: size }}
        className="relative"
      >
        {/* Glow ring behind character */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${outfitColor} 0%, transparent 70%)`,
            transform: 'scale(1.1)',
          }}
        />

        <svg
          viewBox="0 0 100 120"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair back */}
          <ellipse cx="50" cy="30" rx="28" ry="32" fill={hairColor} />

          {/* Hair highlights */}
          <ellipse cx="36" cy="18" rx="8" ry="14" fill={hairColor} opacity="0.8" transform="rotate(-20 36 18)" />
          <ellipse cx="64" cy="18" rx="8" ry="14" fill={hairColor} opacity="0.8" transform="rotate(20 64 18)" />

          {/* Face */}
          <ellipse cx="50" cy="45" rx="22" ry="24" fill="#FDDCB5" />

          {/* Blush */}
          <ellipse cx="33" cy="52" rx="6" ry="3.5" fill="#EC4899" opacity="0.4" />
          <ellipse cx="67" cy="52" rx="6" ry="3.5" fill="#EC4899" opacity="0.4" />

          {/* Eyes */}
          <motion.g
            animate={eyeVariants[mood]}
            transition={{ duration: 0.3 }}
          >
            {/* Left eye */}
            <ellipse cx="42" cy="44" rx="5" ry="6" fill="#1E1B2E" />
            <ellipse cx="40" cy="42" rx="2" ry="2" fill="white" />
            <ellipse cx="44" cy="43" rx="1" ry="1" fill="white" />

            {/* Right eye */}
            <ellipse cx="58" cy="44" rx="5" ry="6" fill="#1E1B2E" />
            <ellipse cx="56" cy="42" rx="2" ry="2" fill="white" />
            <ellipse cx="60" cy="43" rx="1" ry="1" fill="white" />
          </motion.g>

          {/* Eyelashes */}
          <line x1="38" y1="39" x2="36" y2="37" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="42" y1="38" x2="42" y2="36" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="46" y1="39" x2="47" y2="37" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="54" y1="39" x2="53" y2="37" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="58" y1="38" x2="58" y2="36" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="62" y1="39" x2="64" y2="37" stroke="#1E1B2E" strokeWidth="1.2" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="50" cy="53" rx="2" ry="1.2" fill="#E8B89A" />

          {/* Mouth */}
          <motion.path
            d={mouthPaths[mood]}
            stroke="#C26B6B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{ d: mouthPaths[mood] }}
            transition={{ duration: 0.3 }}
          />

          {/* Hair bow / accessory */}
          <path
            d="M 42 10 Q 50 4 58 10 Q 50 16 42 10Z"
            fill={outfitColor}
          />
          <circle cx="50" cy="10" r="3" fill={hairColor} />

          {/* Star earring */}
          <text x="24" y="52" fontSize="7" fill="#F59E0B">★</text>
          <text x="71" y="52" fontSize="7" fill="#F59E0B">★</text>

          {/* Body / outfit */}
          <path
            d="M 28 68 Q 24 72 22 85 Q 22 95 50 97 Q 78 95 78 85 Q 76 72 72 68 Q 62 64 50 63 Q 38 64 28 68Z"
            fill={outfitColor}
          />

          {/* Outfit detail - collar */}
          <path
            d="M 42 64 L 50 72 L 58 64"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stars on outfit */}
          <text x="43" y="85" fontSize="8" fill="#F59E0B" opacity="0.9">★</text>
          <text x="54" y="80" fontSize="6" fill="#06B6D4" opacity="0.9">✦</text>

          {/* Arms */}
          <ellipse cx="22" cy="76" rx="7" ry="10" fill={outfitColor} transform="rotate(-15 22 76)" />
          <ellipse cx="78" cy="76" rx="7" ry="10" fill={outfitColor} transform="rotate(15 78 76)" />

          {/* Hands */}
          <ellipse cx="19" cy="85" rx="5" ry="4" fill="#FDDCB5" transform="rotate(-15 19 85)" />
          <ellipse cx="81" cy="85" rx="5" ry="4" fill="#FDDCB5" transform="rotate(15 81 85)" />

          {/* Microphone in hand (right) */}
          {(mood === 'happy' || mood === 'excited') && (
            <>
              <rect x="80" y="82" width="4" height="10" rx="2" fill="#2D2A4A" />
              <ellipse cx="82" cy="82" rx="4" ry="4" fill="#06B6D4" />
            </>
          )}

          {/* Legs */}
          <rect x="40" y="96" width="8" height="14" rx="3" fill={outfitColor} />
          <rect x="52" y="96" width="8" height="14" rx="3" fill={outfitColor} />

          {/* Shoes */}
          <ellipse cx="44" cy="111" rx="7" ry="4" fill="#1E1B2E" />
          <ellipse cx="56" cy="111" rx="7" ry="4" fill="#1E1B2E" />
        </svg>

        {/* Sparkle overlays for excited mood */}
        {showSparkles && (
          <>
            <motion.span
              className="absolute text-xl pointer-events-none"
              style={{ top: '5%', right: '5%' }}
              animate={{ scale: [0, 1.4, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            >✨</motion.span>
            <motion.span
              className="absolute text-base pointer-events-none"
              style={{ top: '15%', left: '5%' }}
              animate={{ scale: [0, 1.2, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
            >⭐</motion.span>
            <motion.span
              className="absolute text-sm pointer-events-none"
              style={{ bottom: '20%', right: '0%' }}
              animate={{ scale: [0, 1.1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }}
            >💫</motion.span>
          </>
        )}
      </motion.div>

      {showName && name && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          <span
            className="text-kpop-gold font-bold text-lg"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {name}
          </span>
        </motion.div>
      )}
    </div>
  )
}
