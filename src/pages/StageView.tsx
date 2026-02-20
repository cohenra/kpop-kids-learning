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

        {/* ── Stage visualization ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden border border-white/10"
          style={{
            background: 'linear-gradient(180deg, #0D0B1A 0%, #1E1B2E 100%)',
            minHeight: 200,
            boxShadow: '0 0 30px rgba(124,58,237,0.2)',
          }}
        >
          {/* Stage lighting effects */}
          {unlockedStageItems.includes('lighting') && (
            <>
              <motion.div
                className="absolute top-0 left-1/4 w-2 h-full opacity-20"
                style={{ background: 'linear-gradient(180deg, #7C3AED, transparent)' }}
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-0 right-1/4 w-2 h-full opacity-20"
                style={{ background: 'linear-gradient(180deg, #EC4899, transparent)' }}
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}

          {/* LED wall background */}
          {unlockedStageItems.includes('ledWall') && (
            <motion.div
              className="absolute inset-x-0 top-0 h-16"
              style={{
                background: 'linear-gradient(90deg, #7C3AED22, #EC489922, #06B6D422, #7C3AED22)',
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          )}

          {/* Curtains */}
          {unlockedStageItems.includes('curtains') && (
            <>
              <div
                className="absolute top-0 left-0 w-8 h-full opacity-60"
                style={{ background: 'linear-gradient(90deg, #7C3AED, transparent)' }}
              />
              <div
                className="absolute top-0 right-0 w-8 h-full opacity-60"
                style={{ background: 'linear-gradient(270deg, #7C3AED, transparent)' }}
              />
            </>
          )}

          {/* Special effects (confetti) */}
          {unlockedStageItems.includes('effects') && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-sm"
                  style={{ left: `${10 + i * 12}%`, top: `-10%` }}
                  animate={{ y: ['0%', '110%'], rotate: [0, 360] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'linear' }}
                >
                  {['✨', '🌟', '💫', '⭐', '✦', '★', '✨', '💫'][i]}
                </motion.span>
              ))}
            </div>
          )}

          {/* Character on stage */}
          <div className="relative flex justify-center items-end pb-0" style={{ minHeight: 160 }}>
            <Character
              mood={stageFullyBuilt ? 'excited' : 'happy'}
              size={120}
              hairColor={hairColor}
              outfitColor={outfitColor}
            />
          </div>

          {/* Stage floor */}
          {unlockedStageItems.includes('floor') ? (
            <motion.div
              className="h-4 w-full"
              style={{
                background: 'linear-gradient(90deg, #7C3AED, #EC4899, #06B6D4, #7C3AED)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <div className="h-4 w-full bg-white/5 rounded-b-3xl" />
          )}

          {/* Audience */}
          {unlockedStageItems.includes('audience') && (
            <div className="flex justify-center gap-1 py-2 bg-kpop-bg/50">
              {['👧', '👦', '🧒', '👶', '🧒', '👦', '👧'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                >
                  {emoji}
                </motion.span>
              ))}
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
