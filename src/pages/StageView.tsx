import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useProgress } from '../hooks/useProgress'
import { Character } from '../components/Character/Character'
import { SparkCounter } from '../components/UI/SparkCounter'
import { t } from '../i18n/strings'
import {
  STAGE_ITEMS,
  BAND_MEMBERS,
  BANDMATE_THRESHOLDS,
  getNextStageItem,
  getSparksForNextItem,
} from '../data/rewards'

// ─── Stage View screen ────────────────────────────────────────────────────────

export function StageView() {
  const navigate = useNavigate()
  const { activeProfile, language, isRTL, sparks, unlockedStageItems, unlockedBandMembers } = useApp()
  const { getTotalCompleted } = useProgress()
  const s = t(language)

  if (!activeProfile) {
    navigate('/')
    return null
  }

  const hairColor = activeProfile.id === 1 ? '#EC4899' : '#06B6D4'
  const outfitColor = activeProfile.id === 1 ? '#7C3AED' : '#EC4899'

  const nextItem = getNextStageItem(unlockedStageItems)
  const sparksNeeded = getSparksForNextItem(sparks, unlockedStageItems)
  const stageFullyBuilt = unlockedStageItems.length >= STAGE_ITEMS.length
  const stageProgressPct = Math.round((unlockedStageItems.length / STAGE_ITEMS.length) * 100)

  const totalGamesCompleted = getTotalCompleted()

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #0D0B1A 100%)' }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 safe-top border-b border-white/5">
        <motion.button
          className="flex items-center gap-2 text-white/60 font-bold text-base
                     bg-kpop-card/60 px-4 py-2 rounded-full border border-white/10"
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/home')}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          <span>{isRTL ? '→' : '←'}</span>
          {s.back}
        </motion.button>

        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {s.myStageTitle}
        </h1>

        <SparkCounter />
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollable px-4 py-4 space-y-5">

        {/* ── Stage visualization — Concert Stage ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{
            background: '#0A0818',
            minHeight: 220,
            boxShadow: '0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(236,72,153,0.1)',
          }}
        >
          {/* ── LED Wall (back wall panels) ──────────────────────────── */}
          <div className="absolute inset-x-0 top-0 h-28 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 320 112" preserveAspectRatio="xMidYMid slice">
              {/* LED panel grid */}
              {!unlockedStageItems.includes('ledWall')
                ? /* Unlit — dark panels */
                  [0,1,2,3,4,5].map(col => [0,1,2,3].map(row => (
                    <rect
                      key={`${col}-${row}`}
                      x={col * 53 + 3} y={row * 27 + 2}
                      width="49" height="23" rx="3"
                      fill="#120E24" stroke="#1E1B3A" strokeWidth="1"
                    />
                  )))
                : /* Lit — animated colored panels */
                  [0,1,2,3,4,5].map(col => [0,1,2,3].map(row => {
                    const colors = ['#7C3AED','#EC4899','#06B6D4','#F59E0B']
                    const color = colors[(col + row) % 4]
                    return (
                      <motion.rect
                        key={`${col}-${row}`}
                        x={col * 53 + 3} y={row * 27 + 2}
                        width="49" height="23" rx="3"
                        fill={color}
                        opacity={0.35}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 1.5 + (col + row) * 0.15, repeat: Infinity, delay: (col + row) * 0.1 }}
                      />
                    )
                  }))
              }
              {/* LED wall frame */}
              <rect x="1" y="1" width="318" height="110" rx="4" fill="none" stroke="#2D2A4A" strokeWidth="2" />
            </svg>
          </div>

          {/* ── Lighting rig with spotlight cones ────────────────────── */}
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 320 128" preserveAspectRatio="xMidYMid slice">
              {/* Horizontal rig bar */}
              <rect x="8" y="6" width="304" height="7" rx="3.5" fill="#3a3a4a" />
              {/* Rig bolts */}
              {[40, 100, 160, 220, 280].map((x, i) => (
                <circle key={i} cx={x} cy="9.5" r="4" fill="#555566" />
              ))}
              {/* Spotlight cones */}
              {unlockedStageItems.includes('lighting') && (
                <>
                  {[
                    { x: 60, color: '#7C3AED', delay: 0 },
                    { x: 130, color: '#EC4899', delay: 0.4 },
                    { x: 190, color: '#06B6D4', delay: 0.8 },
                    { x: 260, color: '#F59E0B', delay: 1.2 },
                  ].map(({ x, color, delay }, i) => (
                    <motion.path
                      key={i}
                      d={`M ${x} 13 L ${x - 30} 128 L ${x + 30} 128 Z`}
                      fill={color}
                      opacity={0.13}
                      animate={{ opacity: [0.08, 0.22, 0.08] }}
                      transition={{ duration: 2, repeat: Infinity, delay }}
                    />
                  ))}
                  {/* Spotlight fixture rectangles */}
                  {[60, 130, 190, 260].map((x, i) => (
                    <rect key={i} x={x - 7} y="5" width="14" height="14" rx="3" fill="#222233" />
                  ))}
                </>
              )}
            </svg>
          </div>

          {/* ── Curtains (velvet, slide in from sides) ───────────────── */}
          {unlockedStageItems.includes('curtains') && (
            <>
              <motion.div
                className="absolute top-0 left-0 w-12 h-full z-10"
                initial={{ x: -48 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
                style={{
                  background: 'linear-gradient(90deg, #8B0025 0%, #CC003A 60%, #8B002544 100%)',
                }}
              >
                {/* Curtain fold lines */}
                {[10, 22, 34].map(x => (
                  <div key={x} className="absolute top-0 h-full w-px opacity-30"
                    style={{ left: x, background: 'linear-gradient(180deg, #FF6080, transparent)' }} />
                ))}
              </motion.div>
              <motion.div
                className="absolute top-0 right-0 w-12 h-full z-10"
                initial={{ x: 48 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 90, damping: 18, delay: 0.2 }}
                style={{
                  background: 'linear-gradient(270deg, #8B0025 0%, #CC003A 60%, #8B002544 100%)',
                }}
              >
                {[10, 22, 34].map(x => (
                  <div key={x} className="absolute top-0 h-full w-px opacity-30"
                    style={{ right: x, background: 'linear-gradient(180deg, #FF6080, transparent)' }} />
                ))}
              </motion.div>
            </>
          )}

          {/* ── Special effects — confetti + laser sweeps ───────────── */}
          {unlockedStageItems.includes('effects') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              {/* Laser beams sweeping */}
              {['#EC4899','#06B6D4','#7C3AED'].map((color, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 h-full w-0.5 opacity-30"
                  style={{ background: `linear-gradient(180deg, ${color}, transparent 80%)`, left: '50%' }}
                  animate={{ rotate: [-25 + i * 25, 25 - i * 25, -25 + i * 25] }}
                  transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
                />
              ))}
              {/* Falling confetti */}
              {[...Array(10)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm"
                  style={{ left: `${8 + i * 9}%`, top: '-12%' }}
                  animate={{ y: ['0%', '115%'], rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)] }}
                  transition={{
                    duration: 2.5 + i * 0.35,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: 'linear',
                  }}
                >
                  {['✨','🌟','💫','⭐','✦','★','🎊','💥','🌈','🎶'][i]}
                </motion.span>
              ))}
            </div>
          )}

          {/* ── Character on stage (center) ──────────────────────────── */}
          <div
            className="relative flex justify-center items-end z-10"
            style={{ minHeight: 165, paddingTop: 28 }}
          >
            <Character
              mood={stageFullyBuilt ? 'excited' : 'happy'}
              size={125}
              hairColor={hairColor}
              outfitColor={outfitColor}
            />
          </div>

          {/* ── Stage platform + floor ────────────────────────────────── */}
          <div className="relative">
            {/* Platform edge / depth */}
            <div className="h-3 w-full" style={{ background: 'linear-gradient(180deg, #3D2A0A, #2A1D07)' }} />

            {/* Stage floor */}
            {unlockedStageItems.includes('floor') ? (
              <div className="relative overflow-hidden" style={{ height: 16 }}>
                <svg width="100%" height="100%" viewBox="0 0 320 16" preserveAspectRatio="none">
                  {/* Wooden planks base */}
                  <rect width="320" height="16" fill="#7A5020" />
                  {/* Plank divisions */}
                  {[0,40,80,120,160,200,240,280].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="16" stroke="#5A3810" strokeWidth="2" />
                  ))}
                  {/* Warm lighting glow on floor */}
                  <rect width="320" height="16" fill="url(#floorGlow)" />
                  <defs>
                    <radialGradient id="floorGlow" cx="50%" cy="0%" r="60%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
                {/* Animated floor strip overlay */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)',
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            ) : (
              <div className="h-4 w-full" style={{ background: '#1a1040' }} />
            )}
          </div>

          {/* ── Audience silhouettes ──────────────────────────────────── */}
          {unlockedStageItems.includes('audience') && (
            <div className="relative overflow-hidden" style={{ background: '#0A0818' }}>
              <svg width="100%" height="52" viewBox="0 0 320 52" preserveAspectRatio="xMidYMid slice">
                {/* Purple crowd glow */}
                <ellipse cx="160" cy="52" rx="160" ry="35" fill="#7C3AED" opacity="0.18" />
                {/* Audience head silhouettes */}
                {[22, 52, 82, 112, 142, 172, 202, 232, 262, 292].map((x, i) => {
                  const yOff = i % 2 === 0 ? 2 : -2
                  return (
                    <motion.g
                      key={i}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 0.7 + i * 0.08, repeat: Infinity, delay: i * 0.09 }}
                    >
                      {/* Body */}
                      <ellipse cx={x} cy={45 + yOff} rx="12" ry="10" fill="#16103A" />
                      {/* Head */}
                      <ellipse cx={x} cy={30 + yOff} rx="9" ry="10" fill="#16103A" />
                      {/* Glow sticks */}
                      {i % 3 === 0 && (
                        <motion.line
                          x1={x} y1={22 + yOff}
                          x2={x} y2={15 + yOff}
                          stroke={['#EC4899','#06B6D4','#F59E0B'][i % 3]}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.07 }}
                        />
                      )}
                    </motion.g>
                  )
                })}
              </svg>
            </div>
          )}
        </motion.div>

        {/* ── Stage Items Progress ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-kpop-card rounded-3xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              🎭 {isRTL ? 'בנייה במה' : 'Build the Stage'}
            </h2>
            <span className="text-white/50 text-sm ltr-number">{stageProgressPct}%</span>
          </div>

          {/* Overall progress bar */}
          <div className="h-3 bg-white/10 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
              initial={{ width: 0 }}
              animate={{ width: `${stageProgressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          {/* Stage items list */}
          <div className="space-y-2">
            {STAGE_ITEMS.map((item, i) => {
              const isUnlocked = unlockedStageItems.includes(item.id)
              const isNext = nextItem?.id === item.id

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={[
                    'flex items-center gap-3 rounded-2xl px-3 py-2',
                    isUnlocked ? 'bg-kpop-purple/20' : 'bg-white/5',
                    isNext ? 'border border-kpop-gold/40' : '',
                  ].join(' ')}
                >
                  <span className="text-xl">{isUnlocked ? item.emoji : '🔒'}</span>
                  <span
                    className={`flex-1 font-bold ${isUnlocked ? 'text-white' : 'text-white/40'}`}
                    style={{ fontFamily: 'Nunito, Heebo, sans-serif', fontSize: '0.95rem' }}
                  >
                    {language === 'he' ? item.labelHe : item.labelEn}
                  </span>
                  {isUnlocked ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-kpop-gold"
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <span className="text-white/30 text-xs ltr-number flex items-center gap-0.5">
                      <span className="text-kpop-gold/50">✨</span>
                      {item.sparkCost}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Next unlock hint */}
          {nextItem && (
            <motion.div
              className="mt-3 rounded-2xl p-3 border border-kpop-gold/30"
              style={{ background: 'rgba(245,158,11,0.1)' }}
              animate={{ boxShadow: ['0 0 10px rgba(245,158,11,0.1)', '0 0 20px rgba(245,158,11,0.3)', '0 0 10px rgba(245,158,11,0.1)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p
                className="text-kpop-gold text-sm font-bold"
                style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
              >
                {s.nextUnlock}{' '}
                {language === 'he' ? nextItem.labelHe : nextItem.labelEn}
              </p>
              <p className="text-white/50 text-xs mt-0.5 ltr-number">
                ✨ {sparksNeeded} {s.sparksToUnlock}
              </p>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-kpop-gold"
                  style={{ width: `${Math.min(100, (1 - sparksNeeded / nextItem.sparkCost) * 100)}%` }}
                />
              </div>
            </motion.div>
          )}

          {stageFullyBuilt && (
            <motion.div
              className="mt-3 text-center text-xl font-bold text-kpop-gold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              {s.allUnlocked}
            </motion.div>
          )}
        </motion.div>

        {/* ── Band Members — always visible ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-kpop-card rounded-3xl p-4 border border-white/10"
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              🎤 {isRTL ? 'חברות הלהקה' : 'Group Members'}
            </h2>
            <span className="text-white/40 text-sm">
              {unlockedBandMembers.length}/{BAND_MEMBERS.length}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {BAND_MEMBERS.map((member, i) => {
              const isUnlocked = unlockedBandMembers.includes(member.id)
              const threshold = BANDMATE_THRESHOLDS[i]
              const isKiki = threshold.gamesRequired === Infinity

              // Compute unlock hint
              let hintLine = ''
              if (!isUnlocked) {
                if (isKiki) {
                  hintLine = isRTL ? 'בני את הבמה' : 'Build the stage'
                } else {
                  const remaining = Math.max(0, threshold.gamesRequired - totalGamesCompleted)
                  hintLine = remaining === 0
                    ? (isRTL ? 'בקרוב!' : 'Soon!')
                    : isRTL
                      ? `עוד ${remaining} משחקים`
                      : `${remaining} more games`
                }
              }

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 200 }}
                  className={[
                    'relative flex flex-col items-center gap-1 rounded-2xl p-2 border',
                    isUnlocked
                      ? 'bg-kpop-purple/20 border-kpop-purple/30'
                      : 'bg-white/5 border-white/5',
                  ].join(' ')}
                >
                  {isUnlocked ? (
                    <>
                      {/* Unlocked: full color character */}
                      <div className="relative">
                        <Character
                          mood="happy"
                          size={64}
                          hairColor={member.hairColor}
                          outfitColor={member.outfitColor}
                        />
                        <motion.span
                          className="absolute -top-1 -end-1 text-base"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        >
                          {member.emoji}
                        </motion.span>
                      </div>
                      <span
                        className="text-xs font-bold text-center text-white leading-tight"
                        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                      >
                        {language === 'he' ? member.nameHe : member.nameEn}
                      </span>
                      <span
                        className="text-xs text-white/50 text-center leading-tight"
                        style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                      >
                        {language === 'he' ? member.roleHe : member.roleEn}
                      </span>
                    </>
                  ) : (
                    <>
                      {/* Locked: silhouette effect */}
                      <div
                        className="relative rounded-full overflow-hidden"
                        style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.04)' }}
                      >
                        {/* Blurred/desaturated character as silhouette */}
                        <div style={{ filter: 'grayscale(1) brightness(0.3)', opacity: 0.6 }}>
                          <Character
                            mood="idle"
                            size={64}
                            hairColor="#555"
                            outfitColor="#333"
                          />
                        </div>
                        {/* Lock icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl opacity-70">🔒</span>
                        </div>
                      </div>
                      <span
                        className="text-xs font-bold text-white/25 text-center"
                        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                      >
                        ???
                      </span>
                      {/* Game-count hint */}
                      <span
                        className="text-xs text-center leading-tight px-1"
                        style={{
                          fontFamily: 'Nunito, Heebo, sans-serif',
                          color: '#F59E0B99',
                          fontSize: 10,
                        }}
                      >
                        {hintLine}
                      </span>
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Progress bar toward next bandmate */}
          {(() => {
            const nextThreshold = BANDMATE_THRESHOLDS.find(
              (t) => !unlockedBandMembers.includes(t.memberId) && t.gamesRequired !== Infinity
            )
            if (!nextThreshold) return null
            const pct = Math.min(100, Math.round((totalGamesCompleted / nextThreshold.gamesRequired) * 100))
            return (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/40 text-xs" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                    {isRTL ? 'חברה הבאה:' : 'Next member:'}
                  </span>
                  <span className="text-kpop-gold/70 text-xs ltr-number">
                    {totalGamesCompleted}/{nextThreshold.gamesRequired} {isRTL ? 'משחקים' : 'games'}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #EC4899, #F59E0B)', width: `${pct}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })()}
        </motion.div>

        {/* ── Overall stats ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-kpop-card rounded-3xl p-4 border border-white/10 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-kpop-gold ltr-number"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                {sparks}
              </p>
              <p className="text-white/50 text-xs">{isRTL ? 'ניצוצות' : 'Total Sparks'}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-kpop-purple ltr-number"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                {unlockedStageItems.length}
              </p>
              <p className="text-white/50 text-xs">{isRTL ? 'פריטי במה' : 'Stage Items'}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-kpop-pink ltr-number"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                {unlockedBandMembers.length}
              </p>
              <p className="text-white/50 text-xs">{isRTL ? 'חברי להקה' : 'Band Members'}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
