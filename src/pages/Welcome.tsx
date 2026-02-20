import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useProfile } from '../hooks/useProfile'
import { Character } from '../components/Character/Character'
import { Button } from '../components/UI/Button'
import { StarParticles } from '../components/UI/StarParticles'
import { t } from '../i18n/strings'
import type { AgeProfile } from '../utils/storage'

// ─── Welcome / First Launch screen ───────────────────────────────────────────

type Step = 'intro' | 'name' | 'age' | 'reveal'

export function Welcome() {
  const navigate = useNavigate()
  const { language, setLanguage, isRTL } = useApp()
  const { createNewProfile } = useProfile()
  const s = t(language)

  const [step, setStep] = useState<Step>('intro')
  const [characterName, setCharacterName] = useState('')
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input when name step shows
  useEffect(() => {
    if (step === 'name' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [step])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterName(e.target.value)
    if (e.target.value.length > 0) setMood('happy')
    else setMood('idle')
  }

  const handleNameSubmit = () => {
    if (characterName.trim().length < 1) return
    setMood('excited')
    setStep('age')
  }

  const handleAgeSelect = (age: AgeProfile) => {
    setStep('reveal')
    setMood('excited')

    // Create the first profile
    setTimeout(() => {
      createNewProfile(1, characterName.trim(), age, language)
      navigate('/home')
    }, 2200)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 50%, #1E1B3E 100%)' }}
    >
      <StarParticles />

      {/* Language toggle */}
      <motion.button
        className="absolute top-4 end-4 z-20 bg-kpop-card/80 backdrop-blur-sm px-4 py-2 rounded-full text-kpop-cyan font-bold border border-kpop-cyan/30 text-base"
        onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
        whileTap={{ scale: 0.9 }}
        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
      >
        {s.langToggle}
      </motion.button>

      <AnimatePresence mode="wait">

        {/* ── Step: Intro ──────────────────────────────────────────────── */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            className="flex flex-col items-center gap-6 px-6 max-w-sm w-full text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo / Title */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="text-6xl mb-2">🌟</div>
              <h1
                className="text-4xl font-bold leading-tight shimmer-text"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isRTL ? 'אקדמיית הכוכבים' : 'Star Academy'}
              </h1>
            </motion.div>

            {/* Character silhouette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              className="opacity-60"
              style={{ filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.5))' }}
            >
              <Character mood="idle" size={160} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-white/70 text-xl leading-relaxed"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
            >
              {s.welcomeSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="w-full"
            >
              <Button
                onClick={() => setStep('name')}
                variant="primary"
                size="xl"
                fullWidth
              >
                {s.startButton}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* ── Step: Name Input ─────────────────────────────────────────── */}
        {step === 'name' && (
          <motion.div
            key="name"
            className="flex flex-col items-center gap-6 px-6 max-w-sm w-full text-center"
            initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 60 : -60 }}
            transition={{ duration: 0.4 }}
          >
            <Character mood={mood} size={140} showName={false} />

            <motion.h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {s.characterNamePrompt}
            </motion.h2>

            <div className="w-full relative">
              <input
                ref={inputRef}
                type="text"
                value={characterName}
                onChange={handleNameChange}
                placeholder={s.characterNamePlaceholder}
                maxLength={20}
                dir={isRTL ? 'rtl' : 'ltr'}
                className="w-full rounded-2xl px-5 py-4 text-2xl text-center font-bold
                           bg-kpop-card border-2 border-kpop-purple/50 text-white
                           placeholder-white/30 outline-none
                           focus:border-kpop-pink transition-colors"
                style={{
                  fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif',
                  boxShadow: characterName
                    ? '0 0 20px rgba(236,72,153,0.4)'
                    : 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && characterName.trim()) handleNameSubmit()
                }}
              />

              {/* Character count */}
              {characterName.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"
                >
                  {characterName.length}/20
                </motion.span>
              )}
            </div>

            <AnimatePresence>
              {characterName.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full"
                >
                  <Button
                    onClick={handleNameSubmit}
                    variant="gold"
                    size="lg"
                    fullWidth
                  >
                    ✨ {isRTL ? 'המשיכי!' : 'Continue!'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Step: Age Selection ──────────────────────────────────────── */}
        {step === 'age' && (
          <motion.div
            key="age"
            className="flex flex-col items-center gap-6 px-6 max-w-sm w-full text-center"
            initial={{ opacity: 0, x: isRTL ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 60 : -60 }}
            transition={{ duration: 0.4 }}
          >
            <Character mood="happy" size={120} name={characterName} showName />

            <h2
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              {s.chooseAge}
            </h2>

            <div className="flex gap-5 w-full">
              {/* Age 3 */}
              <motion.button
                className="flex-1 flex flex-col items-center gap-3 rounded-3xl p-6
                           bg-kpop-card border-2 border-kpop-cyan/40 cursor-pointer
                           min-h-[140px]"
                style={{ boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => handleAgeSelect(3)}
              >
                <span className="text-5xl">🐣</span>
                <span
                  className="text-kpop-cyan text-2xl font-bold"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  {s.welcomeAge3}
                </span>
              </motion.button>

              {/* Age 5 */}
              <motion.button
                className="flex-1 flex flex-col items-center gap-3 rounded-3xl p-6
                           bg-kpop-card border-2 border-kpop-pink/40 cursor-pointer
                           min-h-[140px]"
                style={{ boxShadow: '0 0 20px rgba(236,72,153,0.3)' }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => handleAgeSelect(5)}
              >
                <span className="text-5xl">⭐</span>
                <span
                  className="text-kpop-pink text-2xl font-bold"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  {s.welcomeAge5}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step: Reveal / Character comes to life ───────────────────── */}
        {step === 'reveal' && (
          <motion.div
            key="reveal"
            className="flex flex-col items-center gap-4 px-6 max-w-sm w-full text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Burst background */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 1.5 }}
              style={{
                background: 'radial-gradient(circle at center, rgba(236,72,153,0.4) 0%, transparent 60%)',
              }}
            />

            {/* Floating star burst */}
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none"
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: [0, 1.5, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 120,
                  y: Math.sin((i / 8) * Math.PI * 2) * 120,
                }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.05 }}
              >
                {['✨', '⭐', '💫', '🌟', '✦', '★', '✨', '⭐'][i]}
              </motion.span>
            ))}

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
            >
              <Character mood="excited" size={180} name={characterName} showName />
            </motion.div>

            <motion.h2
              className="text-3xl font-bold"
              style={{
                fontFamily: 'Fredoka One, Nunito, sans-serif',
                background: 'linear-gradient(90deg, #EC4899, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {isRTL
                ? `!${characterName} ,ברוכה הבאה`
                : `Welcome, ${characterName}!`}
            </motion.h2>

            <motion.p
              className="text-white/70 text-xl"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {isRTL ? '🌟 הכוכב שלך חי!' : '🌟 Your star is alive!'}
            </motion.p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
