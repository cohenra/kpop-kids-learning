import { motion } from 'framer-motion'
import type { HairAccessory } from '../../data/outfitItems'

// ─── Anime-style K-POP character SVG with detailed emotion states ─────────────

type Mood = 'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging'

interface CharacterProps {
  mood?: Mood
  name?: string
  size?: number
  hairColor?: string
  outfitColor?: string
  ribbonColor?: string
  hairAccessory?: HairAccessory
  showName?: boolean
}

export function Character({
  mood = 'idle',
  name,
  size = 160,
  hairColor = '#EC4899',
  outfitColor = '#7C3AED',
  ribbonColor = '#F59E0B',
  hairAccessory = 'star',
  showName = false,
}: CharacterProps) {
  const isExcited = mood === 'excited'
  const isHappy = mood === 'happy'
  const isEncouraging = mood === 'encouraging'

  // Bounce / jump animation per mood
  const bounceAnimation =
    isExcited ? { y: [0, -16, 0, -10, 0], rotate: [-4, 4, -4, 4, 0] } :
    isHappy   ? { y: [0, -10, 0, -6, 0] } :
                { y: [0, -5, 0] }

  const bounceDuration = isExcited ? 0.6 : isHappy ? 1.1 : 2.8

  // Mouth path per mood
  const mouthPath =
    isExcited     ? 'M 34 43 Q 50 58 66 43' :
    isHappy       ? 'M 36 42 Q 50 54 64 42' :
    isEncouraging ? 'M 38 43 Q 50 50 62 43' :
    mood === 'thinking' ? 'M 41 44 Q 50 47 59 44' :
                  'M 40 43 Q 50 49 60 43'

  // Eye scale for each mood
  const eyeScale =
    isExcited     ? 1.1  :
    isHappy       ? 0.28 : // nearly-closed happy squint
    mood === 'thinking' ? 0.65 :
    isEncouraging ? 0.7  :
                    1.0

  const showSparkles = isHappy || isExcited

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={bounceAnimation}
        transition={{ duration: bounceDuration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        style={{ width: size, height: size }}
        className="relative"
      >
        {/* Soft glow ring behind character */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${outfitColor}55 0%, transparent 68%)`,
            transform: 'scale(1.18)',
          }}
        />

        <svg
          viewBox="0 0 100 130"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Iris radial gradient (always deep purple) */}
            <radialGradient id={`iris-${outfitColor.replace('#','')}`} cx="32%" cy="26%" r="72%">
              <stop offset="0%" stopColor="#C4A0FF" />
              <stop offset="38%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#2E0B7A" />
            </radialGradient>
            {/* Hair gradient */}
            <linearGradient id={`hair-${hairColor.replace('#','')}`} x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor={hairColor} />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          {/* ═══════════ HAIR — back layer ═══════════ */}
          {/* Main hair blob */}
          <path
            d="M 50 6 Q 28 4 24 20 Q 18 36 20 52 Q 22 58 26 60 Q 28 38 28 30 Q 28 14 50 12 Q 72 14 72 30 Q 72 38 74 60 Q 78 58 80 52 Q 82 36 76 20 Q 72 4 50 6Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Left ponytail */}
          <path
            d="M 26 50 Q 14 56 10 70 Q 8 82 12 90 Q 16 95 20 92 Q 18 86 18 78 Q 18 66 24 58 Q 26 54 26 50Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Right ponytail */}
          <path
            d="M 74 50 Q 86 56 90 70 Q 92 82 88 90 Q 84 95 80 92 Q 82 86 82 78 Q 82 66 76 58 Q 74 54 74 50Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Ponytail ribbons */}
          <ellipse cx="15" cy="78" rx="4" ry="6" fill={ribbonColor} transform="rotate(-15 15 78)" />
          <ellipse cx="85" cy="78" rx="4" ry="6" fill={ribbonColor} transform="rotate(15 85 78)" />

          {/* ═══════════ BODY ═══════════ */}
          {/* Jacket */}
          <path
            d="M 30 63 Q 24 70 22 85 Q 21 99 50 101 Q 79 99 78 85 Q 76 70 70 63 Q 62 58 50 57 Q 38 58 30 63Z"
            fill={outfitColor}
          />
          {/* Jacket highlight / trim */}
          <path
            d="M 30 63 Q 38 59 50 57 Q 62 59 70 63"
            stroke="#EC4899"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Collar V */}
          <path
            d="M 42 58 L 50 68 L 58 58"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Belt accent */}
          <rect x="33" y="77" width="34" height="4" rx="2" fill="#EC4899" opacity="0.8" />
          {/* Jacket stars */}
          <text x="41" y="92" fontSize="7" fill="#F59E0B" opacity="0.9">★</text>
          <text x="55" y="87" fontSize="5" fill="#06B6D4" opacity="0.9">✦</text>

          {/* Skirt */}
          <path
            d="M 30 79 Q 20 94 18 106 Q 34 108 50 107 Q 66 108 82 106 Q 80 94 70 79Z"
            fill={outfitColor}
            opacity="0.85"
          />
          <text x="37" y="104" fontSize="5" fill="#F59E0B" opacity="0.5">✦</text>
          <text x="56" y="101" fontSize="4" fill="#EC4899" opacity="0.5">★</text>

          {/* ═══════════ ARMS ═══════════ */}
          {/* Left arm */}
          <path
            d={
              isExcited   ? "M 28 66 Q 14 52 10 38" :
              isEncouraging ? "M 28 66 Q 14 58 10 48" :
                             "M 28 66 Q 20 76 18 88"
            }
            stroke={outfitColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Left hand */}
          <ellipse
            cx={isExcited ? 9 : isEncouraging ? 8 : 17}
            cy={isExcited ? 36 : isEncouraging ? 46 : 89}
            rx="5.5" ry="4.5"
            fill="#FDDCB5"
          />
          {/* Finger details left */}
          {!isExcited && !isEncouraging && (
            <>
              <line x1="14" y1="86" x2="12" y2="83" stroke="#E8B89A" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="17" y1="85" x2="16" y2="82" stroke="#E8B89A" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="20" y1="86" x2="20" y2="83" stroke="#E8B89A" strokeWidth="1.2" strokeLinecap="round" />
            </>
          )}

          {/* Right arm */}
          <path
            d={
              isExcited || isHappy ? "M 72 66 Q 86 52 90 38" :
                                     "M 72 66 Q 80 76 82 88"
            }
            stroke={outfitColor}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          {/* Right hand */}
          <ellipse
            cx={isExcited || isHappy ? 91 : 83}
            cy={isExcited || isHappy ? 36 : 89}
            rx="5.5" ry="4.5"
            fill="#FDDCB5"
          />

          {/* Microphone in right hand when happy/excited */}
          {(isHappy || isExcited) && (
            <>
              <rect x="89" y="27" width="4" height="13" rx="2" fill="#2D2A4A" />
              <ellipse cx="91" cy="26" rx="4.5" ry="4.5" fill="#06B6D4" />
              <ellipse cx="91" cy="26" rx="2.5" ry="2.5" fill="white" opacity="0.5" />
            </>
          )}

          {/* Heart emoji for encouraging */}
          {isEncouraging && (
            <text x="2" y="52" fontSize="11" fill="#EC4899">💗</text>
          )}

          {/* ═══════════ LEGS + SHOES ═══════════ */}
          <rect x="39" y="104" width="8" height="14" rx="3" fill={outfitColor} />
          <rect x="53" y="104" width="8" height="14" rx="3" fill={outfitColor} />

          {/* Left shoe with heel */}
          <path d="M 37 117 Q 37 122 44 122 Q 52 122 52 118 L 47 116 L 39 116Z" fill="#2D2A4A" />
          <rect x="37" y="117" width="3" height="5" rx="1" fill="#1a0a2e" />

          {/* Right shoe with heel */}
          <path d="M 49 117 Q 49 122 56 122 Q 64 122 64 118 L 59 116 L 51 116Z" fill="#2D2A4A" />
          <rect x="49" y="117" width="3" height="5" rx="1" fill="#1a0a2e" />

          {/* ═══════════ FACE ═══════════ */}
          {/* Face base */}
          <ellipse cx="50" cy="33" rx="21" ry="23" fill="#FDDCB5" />

          {/* Blush / cheeks */}
          <ellipse cx="33" cy="40" rx="6.5" ry="3.5" fill="#FFB7C5" opacity="0.6" />
          <ellipse cx="67" cy="40" rx="6.5" ry="3.5" fill="#FFB7C5" opacity="0.6" />

          {/* Ears */}
          <ellipse cx="29" cy="35" rx="3.5" ry="4.5" fill="#FDDCB5" />
          <ellipse cx="71" cy="35" rx="3.5" ry="4.5" fill="#FDDCB5" />
          {/* Ear inner */}
          <ellipse cx="29" cy="35" rx="1.5" ry="2.5" fill="#F5C6C6" opacity="0.6" />
          <ellipse cx="71" cy="35" rx="1.5" ry="2.5" fill="#F5C6C6" opacity="0.6" />
          {/* Star earrings */}
          <text x="26" y="44" fontSize="5" fill="#F59E0B">✦</text>
          <text x="69" y="44" fontSize="5" fill="#F59E0B">✦</text>

          {/* ═══════════ EYES ═══════════ */}
          {/* ── LEFT EYE ── */}
          <g transform="translate(38, 30)">
            {/* Eyebrow */}
            <path
              d="M -8 -13 Q -1 -16 7 -14"
              stroke="#3a1a3a"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />

            {isExcited ? (
              /* Star eye for excited */
              <text
                x="-8"
                y="7"
                fontSize="15"
                fill="#F59E0B"
                textAnchor="middle"
              >★</text>
            ) : (
              <motion.g
                animate={{ scaleY: eyeScale }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ transformOrigin: '0px 0px' }}
              >
                {/* White sclera (blue-tinted) */}
                <ellipse cx="0" cy="0" rx="7" ry="8.5" fill="#EEF3FF" />
                {/* Upper eyelid shadow */}
                <ellipse cx="0" cy="-4" rx="7" ry="5.5" fill="#1a0a2e" opacity="0.45" />
                {/* Iris */}
                <ellipse
                  cx="0" cy="0"
                  rx="5.5" ry="6.5"
                  fill={`url(#iris-${outfitColor.replace('#','')})`}
                />
                {/* Pupil */}
                <ellipse cx="0" cy="1" rx="2.8" ry="3.2" fill="#0D0620" />
                {/* Specular highlight 1 */}
                <circle cx="2.5" cy="-2.5" r="2" fill="white" />
                {/* Specular highlight 2 */}
                <circle cx="0.5" cy="1.5" r="0.9" fill="white" opacity="0.55" />
              </motion.g>
            )}

            {/* Upper lashes (always shown) */}
            <line x1="-5.5" y1="-8" x2="-7.5" y2="-12.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="-2.5" y1="-9" x2="-3.5" y2="-13.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="0.5" y1="-9.5" x2="0.5" y2="-14" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="3.5" y1="-8.5" x2="5" y2="-12.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
          </g>

          {/* ── RIGHT EYE ── */}
          <g transform="translate(62, 30)">
            {/* Eyebrow */}
            <path
              d="M -7 -14 Q 1 -16 8 -13"
              stroke="#3a1a3a"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />

            {isExcited ? (
              <text
                x="-8"
                y="7"
                fontSize="15"
                fill="#F59E0B"
                textAnchor="middle"
              >★</text>
            ) : (
              <motion.g
                animate={{ scaleY: eyeScale }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <ellipse cx="0" cy="0" rx="7" ry="8.5" fill="#EEF3FF" />
                <ellipse cx="0" cy="-4" rx="7" ry="5.5" fill="#1a0a2e" opacity="0.45" />
                <ellipse
                  cx="0" cy="0"
                  rx="5.5" ry="6.5"
                  fill={`url(#iris-${outfitColor.replace('#','')})`}
                />
                <ellipse cx="0" cy="1" rx="2.8" ry="3.2" fill="#0D0620" />
                <circle cx="2.5" cy="-2.5" r="2" fill="white" />
                <circle cx="0.5" cy="1.5" r="0.9" fill="white" opacity="0.55" />
              </motion.g>
            )}

            <line x1="-5.5" y1="-8" x2="-7" y2="-12.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="-2.5" y1="-9" x2="-3.5" y2="-13.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="0.5" y1="-9.5" x2="0.5" y2="-14" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="3.5" y1="-8.5" x2="5" y2="-12.5" stroke="#1a0a2e" strokeWidth="1.3" strokeLinecap="round" />
          </g>

          {/* ── Nose ── */}
          <ellipse cx="47" cy="40" rx="1.3" ry="1" fill="#E8B89A" />
          <ellipse cx="53" cy="40" rx="1.3" ry="1" fill="#E8B89A" />

          {/* ── Mouth ── */}
          <path
            d={mouthPath}
            stroke="#C26B6B"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          {/* Teeth for big smiles */}
          {(isExcited || isHappy) && (
            <path
              d={isExcited ? 'M 36 47 Q 50 56 64 47 L 64 50 Q 50 60 36 50Z' : 'M 38 46 Q 50 54 62 46 L 62 49 Q 50 57 38 49Z'}
              fill="white"
              opacity="0.85"
            />
          )}

          {/* ═══════════ HAIR — front / bangs ═══════════ */}
          {/* Main bangs covering forehead */}
          <path
            d="M 29 30 Q 28 15 36 11 Q 42 8 50 9 Q 58 8 64 11 Q 72 15 71 30 Q 65 22 50 21 Q 35 22 29 30Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Left bang strand */}
          <path
            d="M 29 30 Q 26 34 27 40 Q 28 37 30 33 Q 30 30 29 30Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Right bang strand */}
          <path
            d="M 71 30 Q 74 34 73 40 Q 72 37 70 33 Q 70 30 71 30Z"
            fill={`url(#hair-${hairColor.replace('#','')})`}
          />
          {/* Center part highlight */}
          <path
            d="M 46 10 Q 44 17 46 24 Q 48 22 50 21 Q 52 22 54 24 Q 56 17 54 10"
            fill={hairColor}
            opacity="0.75"
          />
          {/* Hair shine streak */}
          <path
            d="M 36 12 Q 41 10 46 11"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.45"
          />
          {/* ═══════════ HAIR ACCESSORY ═══════════ */}
          {hairAccessory === 'star' && (
            <text x="67" y="22" fontSize="7" fill="#F59E0B">★</text>
          )}
          {hairAccessory === 'bow' && (
            <g>
              {/* Left wing */}
              <path d="M 50 9 Q 43 4 38 9 Q 43 14 50 11Z" fill={ribbonColor} />
              {/* Right wing */}
              <path d="M 50 9 Q 57 4 62 9 Q 57 14 50 11Z" fill={ribbonColor} />
              {/* Center knot */}
              <ellipse cx="50" cy="10" rx="3" ry="2.2" fill={ribbonColor} />
              <ellipse cx="50" cy="10" rx="1.5" ry="1.1" fill="white" opacity="0.35" />
            </g>
          )}
          {hairAccessory === 'tiara' && (
            <g>
              {/* Band */}
              <path d="M 33 25 Q 41 19 50 17 Q 59 19 67 25"
                stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Center gem */}
              <circle cx="50" cy="17" r="3.2" fill="#EC4899" />
              <circle cx="50" cy="17" r="1.6" fill="white" opacity="0.45" />
              {/* Side gems */}
              <circle cx="41" cy="21" r="2" fill="#06B6D4" />
              <circle cx="59" cy="21" r="2" fill="#7C3AED" />
            </g>
          )}
          {hairAccessory === 'crown' && (
            <g>
              {/* Crown body */}
              <path d="M 34 14 L 37 6 L 44 12 L 50 4 L 56 12 L 63 6 L 66 14 Q 50 11 34 14Z"
                fill="#F59E0B" />
              {/* Crown base band */}
              <path d="M 34 14 Q 50 17 66 14" stroke="#F59E0B" strokeWidth="2.5"
                fill="none" strokeLinecap="round" />
              {/* Gems on points */}
              <circle cx="50" cy="5"  r="2.5" fill="#EC4899" />
              <circle cx="37" cy="7"  r="1.8" fill="#06B6D4" />
              <circle cx="63" cy="7"  r="1.8" fill="#7C3AED" />
              {/* Gem shine */}
              <circle cx="50" cy="4"  r="1"   fill="white" opacity="0.6" />
            </g>
          )}
        </svg>

        {/* Sparkle effects around character for happy/excited moods */}
        {showSparkles && (
          <>
            <motion.span
              className="absolute text-xl pointer-events-none"
              style={{ top: '4%', right: '4%' }}
              animate={{ scale: [0, 1.5, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 0.85, repeat: Infinity, delay: 0 }}
            >✨</motion.span>
            <motion.span
              className="absolute text-base pointer-events-none"
              style={{ top: '12%', left: '3%' }}
              animate={{ scale: [0, 1.3, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 0.85, repeat: Infinity, delay: 0.28 }}
            >⭐</motion.span>
            <motion.span
              className="absolute text-sm pointer-events-none"
              style={{ bottom: '22%', right: '2%' }}
              animate={{ scale: [0, 1.2, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: 0.5 }}
            >💫</motion.span>
            {isExcited && (
              <motion.span
                className="absolute text-base pointer-events-none"
                style={{ bottom: '28%', left: '4%' }}
                animate={{ scale: [0, 1.1, 0], rotate: [0, 90, 180] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: 0.15 }}
              >🌟</motion.span>
            )}
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
