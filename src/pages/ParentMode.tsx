import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useParentMode } from '../hooks/useParentMode'
import { Button } from '../components/UI/Button'
import { getProfile } from '../utils/storage'
import { ROOMS } from '../data/games'
import { useApp } from '../context/AppContext'
import { t } from '../i18n/strings'

// ─── Parent Mode screen ───────────────────────────────────────────────────────

const PIN_LENGTH = 4

export function ParentMode() {
  const navigate = useNavigate()
  const { language, isRTL } = useApp()
  const s = t(language)
  const {
    isUnlocked,
    hasPin,
    unlock,
    lock,
    setupPin,
    toggleRoomLock,
    isRoomLocked,
  } = useParentMode()

  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [settingPin, setSettingPin] = useState(!hasPin)
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new')
  const [error, setError] = useState('')

  const profile1 = getProfile(1)
  const profile2 = getProfile(2)

  const handlePinPress = (digit: string) => {
    setError('')
    if (settingPin) {
      if (pinStep === 'new') {
        const updated = newPin + digit
        setNewPin(updated)
        if (updated.length === PIN_LENGTH) setPinStep('confirm')
      } else {
        const updated = confirmPin + digit
        setConfirmPin(updated)
        if (updated.length === PIN_LENGTH) {
          if (updated === newPin) {
            setupPin(updated)
            setSettingPin(false)
          } else {
            setError(isRTL ? 'הקודים אינם תואמים' : "PINs don't match")
            setNewPin('')
            setConfirmPin('')
            setPinStep('new')
          }
        }
      }
    } else {
      const updated = pin + digit
      setPin(updated)
      if (updated.length === PIN_LENGTH) {
        const success = unlock(updated)
        if (!success) {
          setError(isRTL ? 'קוד שגוי' : 'Wrong PIN')
          setPin('')
        }
      }
    }
  }

  const handleBackspace = () => {
    setError('')
    if (settingPin) {
      if (pinStep === 'new') setNewPin((p) => p.slice(0, -1))
      else setConfirmPin((p) => p.slice(0, -1))
    } else {
      setPin((p) => p.slice(0, -1))
    }
  }

  const currentPinLength = settingPin
    ? pinStep === 'new' ? newPin.length : confirmPin.length
    : pin.length

  if (!isUnlocked) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(160deg, #1E1B2E, #0D0B1A)' }}
      >
        <motion.button
          className="absolute top-4 start-4 text-white/50 bg-kpop-card/50 px-4 py-2 rounded-full border border-white/10 font-bold"
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/home')}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {isRTL ? '→' : '←'} {s.back}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 max-w-xs w-full px-6"
        >
          <div className="text-6xl">🔒</div>

          <h1
            className="text-3xl font-bold text-white text-center"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {s.parentMode}
          </h1>

          <p className="text-white/50 text-center" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
            {settingPin
              ? (pinStep === 'new'
                ? (isRTL ? 'הגדירי קוד חדש (4 ספרות)' : 'Set a new 4-digit PIN')
                : (isRTL ? 'אשרי את הקוד' : 'Confirm your PIN'))
              : (isRTL ? 'הכניסי קוד הורים' : 'Enter parent PIN')}
          </p>

          {/* PIN dots */}
          <div className="flex gap-4">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full"
                style={{
                  background: i < currentPinLength ? '#7C3AED' : 'rgba(255,255,255,0.2)',
                }}
                animate={i < currentPinLength ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-base font-bold"
                style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* PIN keypad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[1,2,3,4,5,6,7,8,9].map((d) => (
              <motion.button
                key={d}
                className="rounded-2xl py-4 text-2xl font-bold text-white bg-kpop-card
                           border border-white/10 min-h-[60px]"
                whileTap={{ scale: 0.9, background: 'rgba(124,58,237,0.3)' }}
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                onClick={() => handlePinPress(String(d))}
              >
                {d}
              </motion.button>
            ))}
            <div /> {/* empty */}
            <motion.button
              className="rounded-2xl py-4 text-2xl font-bold text-white bg-kpop-card
                         border border-white/10 min-h-[60px]"
              whileTap={{ scale: 0.9 }}
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              onClick={() => handlePinPress('0')}
            >
              0
            </motion.button>
            <motion.button
              className="rounded-2xl py-4 text-xl text-white/50 bg-kpop-card/50
                         border border-white/10 min-h-[60px]"
              whileTap={{ scale: 0.9 }}
              onClick={handleBackspace}
            >
              ⌫
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Dashboard (unlocked) ─────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E, #0D0B1A)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 safe-top border-b border-white/5">
        <motion.button
          className="text-white/50 bg-kpop-card/50 px-4 py-2 rounded-full border border-white/10 font-bold"
          whileTap={{ scale: 0.93 }}
          onClick={() => { lock(); navigate('/home') }}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {isRTL ? '→' : '←'} {s.back}
        </motion.button>
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {s.parentMode}
        </h1>
        <div className="text-2xl">👑</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollable px-4 py-4 space-y-4">

        {/* Profile summaries */}
        {[profile1, profile2].filter(Boolean).map((profile) => {
          if (!profile) return null
          return (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-kpop-card rounded-3xl p-4 border border-white/10"
            >
              <h2
                className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                👤 {profile.characterName}{' '}
                <span className="text-white/40 text-sm font-normal">
                  {isRTL ? `גיל ${profile.age}` : `Age ${profile.age}`}
                </span>
              </h2>

              <div className="flex gap-4 mb-2">
                <div className="text-center">
                  <p className="text-kpop-gold text-2xl font-bold ltr-number"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                    {profile.sparks}
                  </p>
                  <p className="text-white/40 text-xs">✨ Sparks</p>
                </div>
                <div className="text-center">
                  <p className="text-kpop-purple text-2xl font-bold ltr-number"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                    {profile.unlockedStageItems.length}
                  </p>
                  <p className="text-white/40 text-xs">🎭 Stage</p>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Room locks */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-kpop-card rounded-3xl p-4 border border-white/10"
        >
          <h2
            className="text-xl font-bold text-white mb-3"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            🔒 {isRTL ? 'נעילת חדרים' : 'Room Locks'}
          </h2>

          <div className="space-y-2">
            {ROOMS.map((room) => {
              const roomStrings = s.rooms[room.id]
              const locked = isRoomLocked(room.id)
              return (
                <div
                  key={room.id}
                  className="flex items-center justify-between py-2 border-b border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{room.emoji}</span>
                    <span className="text-white text-base" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                      {roomStrings.name}
                    </span>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleRoomLock(room.id)}
                    className={[
                      'w-12 h-6 rounded-full relative transition-all',
                      locked ? 'bg-red-500/50' : 'bg-kpop-purple/60',
                    ].join(' ')}
                    style={{ minWidth: 48, minHeight: 30 }}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                      animate={{ x: locked ? (isRTL ? 1 : 1) : (isRTL ? 1 : 25) }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ insetInlineStart: 2 }}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </motion.div>

        <Button
          onClick={() => { lock(); navigate('/home') }}
          variant="ghost"
          size="lg"
          fullWidth
        >
          🔒 {isRTL ? 'נעול והחזרה' : 'Lock & Return'}
        </Button>
      </div>
    </div>
  )
}
