import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../../../context/AppContext'

// ─── Creative Zone Room ────────────────────────────────────────────────────────
//
// Houses both creative activities:
//   🎵  Band Song (Song Studio) — unlocked after first band member joins
//   🎨  Drawing Room            — always available
//
// Rendered inside GameRoom.tsx when roomId === 'creative'.

export function CreativeRoom() {
  const navigate = useNavigate()
  const { language, isRTL, backArrow, unlockedBandMembers } = useApp()
  const isHe = language === 'he'
  const songUnlocked = unlockedBandMembers.length > 0

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1842 100%)' }}
    >
      {/* Back button */}
      <motion.button
        className="absolute top-4 start-4 z-20 flex items-center gap-2 text-white/60
                   bg-white/5 px-4 py-2 rounded-full border border-white/10 font-bold"
        whileTap={{ scale: 0.93 }}
        onClick={() => navigate('/home')}
        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
      >
        <span>{backArrow}</span>
        {isHe ? 'חזרה' : 'Back'}
      </motion.button>

      {/* Title */}
      <div className="flex flex-col items-center pt-16 pb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220 }}
          className="text-5xl mb-2"
        >
          🎨
        </motion.div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-bold text-white text-center"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {isHe ? 'אזור היצירה' : 'Creative Zone'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-white/50 text-base text-center mt-1"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        >
          {isHe ? 'ציירי, שירי, צרי!' : 'Draw, sing, create!'}
        </motion.p>
      </div>

      {/* Activity cards */}
      <div className="flex-1 flex flex-col justify-center gap-5 px-8" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Song Studio card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 18 }}
        >
          {songUnlocked ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/song')}
              className="w-full rounded-3xl p-5 flex items-center gap-4 border text-start"
              style={{
                background: 'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(45,42,74,0.92) 100%)',
                borderColor: 'rgba(6,182,212,0.35)',
                boxShadow: '0 0 24px rgba(6,182,212,0.18)',
              }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: 'rgba(6,182,212,0.18)' }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎵
              </motion.div>
              <div className="flex-1">
                <h2
                  className="text-xl font-bold text-kpop-cyan"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  {isHe ? 'שיר הלהקה' : 'Band Song'}
                </h2>
                <p className="text-white/55 text-sm mt-0.5" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                  {isHe
                    ? 'בחרי מילים ובני שיר K-POP עם הלהקה שלך'
                    : 'Pick words and build a K-POP song with your band'}
                </p>
              </div>
              <span className="text-kpop-cyan/60 text-2xl flex-shrink-0">
                {isRTL ? '←' : '→'}
              </span>
            </motion.button>
          ) : (
            <div
              className="w-full rounded-3xl p-5 flex items-center gap-4 border opacity-40"
              style={{ background: 'rgba(45,42,74,0.5)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', filter: 'grayscale(1)' }}
              >
                🎵
              </div>
              <div className="flex-1">
                <h2
                  className="text-xl font-bold text-white/40"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  🔒 {isHe ? 'שיר הלהקה' : 'Band Song'}
                </h2>
                <p className="text-white/30 text-sm mt-0.5" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                  {isHe
                    ? 'גייסי את חברת הלהקה הראשונה שלך כדי לפתוח'
                    : 'Recruit your first band member to unlock'}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Drawing Room card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 200, damping: 18 }}
        >
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/draw')}
            className="w-full rounded-3xl p-5 flex items-center gap-4 border text-start"
            style={{
              background: 'linear-gradient(135deg, rgba(236,72,153,0.22) 0%, rgba(45,42,74,0.92) 100%)',
              borderColor: 'rgba(236,72,153,0.35)',
              boxShadow: '0 0 24px rgba(236,72,153,0.18)',
            }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: 'rgba(236,72,153,0.18)' }}
              animate={{ rotate: [0, -12, 12, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              🎨
            </motion.div>
            <div className="flex-1">
              <h2
                className="text-xl font-bold text-kpop-pink"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isHe ? 'חדר הציור' : 'Drawing Room'}
              </h2>
              <p className="text-white/55 text-sm mt-0.5" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                {isHe
                  ? 'צבעי תמונות K-POP עם האצבע'
                  : 'Color K-POP pictures with your finger'}
              </p>
            </div>
            <span className="text-kpop-pink/60 text-2xl flex-shrink-0">
              {isRTL ? '←' : '→'}
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom sparkle deco */}
      <div className="pb-8 flex justify-center">
        <motion.div
          className="text-white/20 text-2xl tracking-widest"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          ✨ ✨ ✨
        </motion.div>
      </div>
    </div>
  )
}
