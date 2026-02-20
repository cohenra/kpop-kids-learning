import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useProfile } from '../hooks/useProfile'
import { Character } from '../components/Character/Character'
import { Button } from '../components/UI/Button'
import { StarParticles } from '../components/UI/StarParticles'
import { Modal } from '../components/UI/Modal'
import { t } from '../i18n/strings'
import { getProfile } from '../utils/storage'
import type { AgeProfile } from '../utils/storage'
import { STAGE_ITEMS } from '../data/rewards'

// ─── Profile Select screen ────────────────────────────────────────────────────

const HAIR_COLORS = ['#EC4899', '#06B6D4']
const OUTFIT_COLORS = ['#7C3AED', '#EC4899']

export function ProfileSelect() {
  const navigate = useNavigate()
  const { language, isRTL, setActiveProfileId } = useApp()
  const { createNewProfile } = useProfile()
  const s = t(language)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState<AgeProfile>(5)

  const profile1 = getProfile(1)
  const profile2 = getProfile(2)

  const handleSelectProfile = (id: 1 | 2) => {
    setActiveProfileId(id)
    navigate('/home')
  }

  const handleAddProfile = () => {
    const targetId: 1 | 2 = profile1 ? 2 : 1
    if (!newName.trim()) return
    createNewProfile(targetId, newName.trim(), newAge, language)
    setShowAddModal(false)
    setNewName('')
    navigate('/home')
  }

  // Calculate stage progress percentage
  const getStageProgress = (unlockedItems: string[]): number => {
    return Math.round((unlockedItems.length / STAGE_ITEMS.length) * 100)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 50%, #1E1B3E 100%)' }}
    >
      <StarParticles />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-md">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center"
          style={{
            fontFamily: 'Fredoka One, Nunito, sans-serif',
            background: 'linear-gradient(90deg, #EC4899, #F59E0B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {s.chooseProfile}
        </motion.h1>

        {/* Profile cards */}
        <div className="flex flex-col gap-4 w-full">
          {[1, 2].map((rawId) => {
            const id = rawId as 1 | 2
            const profile = id === 1 ? profile1 : profile2
            const hairColor = HAIR_COLORS[id - 1]
            const outfitColor = OUTFIT_COLORS[id - 1]

            if (!profile) {
              // Empty slot
              const otherProfile = id === 1 ? profile1 : profile2
              if (!otherProfile && id === 2) return null // Don't show slot 2 if slot 1 is also empty

              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: id * 0.1 }}
                  className="w-full rounded-3xl p-5 border-2 border-dashed border-white/20
                             flex items-center justify-center gap-3 cursor-pointer
                             min-h-[100px] bg-kpop-card/40"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddModal(true)}
                >
                  <span className="text-3xl">➕</span>
                  <span
                    className="text-white/50 text-xl font-bold"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                  >
                    {s.addProfile}
                  </span>
                </motion.button>
              )
            }

            const stagePercent = getStageProgress(profile.unlockedStageItems)

            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: id * 0.15, type: 'spring', stiffness: 200 }}
                className="w-full rounded-3xl p-4 cursor-pointer text-start
                           border border-white/10 overflow-hidden relative"
                style={{
                  background: id === 1
                    ? 'linear-gradient(135deg, #2D2A4A, #3D1F5E)'
                    : 'linear-gradient(135deg, #2D2A4A, #1F3D5E)',
                  boxShadow: id === 1
                    ? '0 0 25px rgba(124,58,237,0.3)'
                    : '0 0 25px rgba(6,182,212,0.3)',
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectProfile(id)}
              >
                {/* Glow accent */}
                <div
                  className="absolute top-0 end-0 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                  style={{
                    background: id === 1 ? '#7C3AED' : '#06B6D4',
                    filter: 'blur(20px)',
                    transform: 'translate(30%, -30%)',
                  }}
                />

                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Character
                      mood="happy"
                      size={90}
                      hairColor={hairColor}
                      outfitColor={outfitColor}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2
                        className="text-2xl font-bold text-white truncate"
                        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                      >
                        {profile.characterName}
                      </h2>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{
                          background: id === 1
                            ? 'rgba(124,58,237,0.6)'
                            : 'rgba(6,182,212,0.6)',
                        }}
                      >
                        {isRTL ? `גיל ${profile.age}` : `Age ${profile.age}`}
                      </span>
                    </div>

                    {/* Sparks */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-kpop-gold text-base">✨</span>
                      <span
                        className="text-kpop-gold font-bold ltr-number"
                        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                      >
                        {profile.sparks}
                      </span>
                      <span className="text-white/50 text-sm">{s.sparks}</span>
                    </div>

                    {/* Stage progress bar */}
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>{isRTL ? 'במה' : 'Stage'}</span>
                        <span className="ltr-number">{stagePercent}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: id === 1
                              ? 'linear-gradient(90deg, #7C3AED, #EC4899)'
                              : 'linear-gradient(90deg, #06B6D4, #7C3AED)',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${stagePercent}%` }}
                          transition={{ delay: 0.5 + id * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tap arrow */}
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-white/40 text-2xl flex-shrink-0"
                  >
                    {isRTL ? '←' : '→'}
                  </motion.div>
                </div>

                {/* Tap hint */}
                <p
                  className="text-center text-white/30 text-sm mt-2"
                  style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                >
                  {s.tapToPlay}
                </p>
              </motion.button>
            )
          })}

          {/* Add second profile if first exists */}
          {profile1 && !profile2 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full rounded-3xl p-4 border-2 border-dashed border-white/20
                         flex items-center justify-center gap-3 cursor-pointer
                         min-h-[80px] bg-kpop-card/30"
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddModal(true)}
            >
              <span className="text-2xl">➕</span>
              <span
                className="text-white/50 text-lg font-bold"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {s.addProfile}
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Add Profile Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isRTL ? 'פרופיל חדש' : 'New Profile'}
      >
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={s.characterNamePlaceholder}
            maxLength={20}
            dir={isRTL ? 'rtl' : 'ltr'}
            autoFocus
            className="w-full rounded-2xl px-4 py-3 text-xl text-center font-bold
                       bg-kpop-bg border-2 border-kpop-purple/50 text-white
                       placeholder-white/30 outline-none focus:border-kpop-pink
                       transition-colors"
            style={{ fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newName.trim()) handleAddProfile()
            }}
          />

          <div className="flex gap-3">
            <button
              className={`flex-1 rounded-2xl py-3 font-bold text-lg border-2 transition-all
                ${newAge === 3
                  ? 'border-kpop-cyan bg-kpop-cyan/20 text-kpop-cyan'
                  : 'border-white/20 text-white/50'}`}
              onClick={() => setNewAge(3)}
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 60 }}
            >
              🐣 {s.welcomeAge3}
            </button>
            <button
              className={`flex-1 rounded-2xl py-3 font-bold text-lg border-2 transition-all
                ${newAge === 5
                  ? 'border-kpop-pink bg-kpop-pink/20 text-kpop-pink'
                  : 'border-white/20 text-white/50'}`}
              onClick={() => setNewAge(5)}
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 60 }}
            >
              ⭐ {s.welcomeAge5}
            </button>
          </div>

          <Button
            onClick={handleAddProfile}
            disabled={!newName.trim()}
            variant="primary"
            size="lg"
            fullWidth
          >
            {isRTL ? 'צרי פרופיל!' : 'Create Profile!'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
