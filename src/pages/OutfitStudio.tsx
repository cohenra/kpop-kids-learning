import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Character } from '../components/Character/Character'
import {
  HAIR_COLORS,
  OUTFIT_COLORS,
  ACCESSORIES,
  type HairAccessory,
} from '../data/outfitItems'

// ─── OutfitStudio ─────────────────────────────────────────────────────────────
//
// Three tabs: Hair Color | Outfit Color | Accessory
//
// Tapping an unlocked option → instant live preview + auto-save via updateOutfit.
// Tapping a locked option    → brief "need X ✨" flash toast.
// Character preview pulses/bounces whenever a selection is made.

type Tab = 'hair' | 'outfit' | 'accessory'

interface LockedToast {
  visible: boolean
  cost: number
}

export function OutfitStudio() {
  const navigate  = useNavigate()
  const { language, sparks, outfit, updateOutfit, backArrow } = useApp()
  const isHe = language === 'he'

  const [activeTab, setActiveTab] = useState<Tab>('hair')
  const [lockedToast, setLockedToast] = useState<LockedToast>({ visible: false, cost: 0 })
  // Bump key to trigger character bounce animation on each selection
  const [bounceKey, setBounceKey] = useState(0)

  // ── Selection handlers ──────────────────────────────────────────────────────
  const trySelect = (cost: number, onSelect: () => void) => {
    if (sparks < cost) {
      setLockedToast({ visible: true, cost })
      setTimeout(() => setLockedToast({ visible: false, cost: 0 }), 1800)
      return
    }
    onSelect()
    setBounceKey((k) => k + 1)
  }

  const tabs: { id: Tab; labelHe: string; labelEn: string; emoji: string }[] = [
    { id: 'hair',      labelHe: 'שיער',    labelEn: 'Hair',    emoji: '💇' },
    { id: 'outfit',    labelHe: 'תלבושת',  labelEn: 'Outfit',  emoji: '👗' },
    { id: 'accessory', labelHe: 'אקססורי', labelEn: 'Accessory', emoji: '✨' },
  ]

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #16142A 100%)' }}
    >
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 safe-top">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="w-11 h-11 flex items-center justify-center rounded-full
                     bg-white/10 text-white text-xl border border-white/10"
        >
          {backArrow}
        </motion.button>

        <h1
          className="text-white font-bold text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {isHe ? '🎨 סטודיו הלבוש' : '🎨 Outfit Studio'}
        </h1>

        {/* Spark counter */}
        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <span className="text-kpop-gold font-bold text-sm" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
            {sparks}
          </span>
          <span>✨</span>
        </div>
      </div>

      {/* ── Character preview ──────────────────────────────────────────── */}
      <div className="flex justify-center pt-2 pb-1 relative">
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center 40%, ${outfit.outfitColor}66 0%, transparent 65%)`,
          }}
        />
        <motion.div
          key={bounceKey}
          animate={{ scale: [1, 1.06, 0.97, 1.03, 1] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Character
            mood="happy"
            size={160}
            hairColor={outfit.hairColor}
            outfitColor={outfit.outfitColor}
            ribbonColor={outfit.hairColor}   // ribbon matches hair
            hairAccessory={outfit.hairAccessory}
          />
        </motion.div>
      </div>

      {/* ── Tab bar ────────────────────────────────────────────────────── */}
      <div className="flex mx-4 gap-2 mb-3">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl text-sm font-bold border transition-all"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                : 'rgba(45,42,74,0.8)',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.5)',
              borderColor: activeTab === tab.id
                ? 'transparent'
                : 'rgba(255,255,255,0.08)',
              boxShadow: activeTab === tab.id ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {tab.emoji} {isHe ? tab.labelHe : tab.labelEn}
          </motion.button>
        ))}
      </div>

      {/* ── Options grid ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'hair' && (
            <motion.div
              key="hair"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-3 gap-3"
            >
              {HAIR_COLORS.map((opt) => {
                const isSelected = outfit.hairColor === opt.color
                const isLocked   = sparks < opt.sparkCost
                return (
                  <ColorSwatch
                    key={opt.id}
                    color={opt.color}
                    label={isHe ? opt.labelHe : opt.labelEn}
                    cost={opt.sparkCost}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onTap={() => trySelect(opt.sparkCost, () => updateOutfit({ hairColor: opt.color }))}
                  />
                )
              })}
            </motion.div>
          )}

          {activeTab === 'outfit' && (
            <motion.div
              key="outfit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-3 gap-3"
            >
              {OUTFIT_COLORS.map((opt) => {
                const isSelected = outfit.outfitColor === opt.color
                const isLocked   = sparks < opt.sparkCost
                return (
                  <ColorSwatch
                    key={opt.id}
                    color={opt.color}
                    label={isHe ? opt.labelHe : opt.labelEn}
                    cost={opt.sparkCost}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    onTap={() => trySelect(opt.sparkCost, () => updateOutfit({ outfitColor: opt.color }))}
                  />
                )
              })}
            </motion.div>
          )}

          {activeTab === 'accessory' && (
            <motion.div
              key="accessory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-2 gap-3"
            >
              {ACCESSORIES.map((opt) => {
                const isSelected = outfit.hairAccessory === opt.id
                const isLocked   = sparks < opt.sparkCost
                return (
                  <AccessoryCard
                    key={opt.id}
                    id={opt.id}
                    emoji={opt.emoji}
                    label={isHe ? opt.labelHe : opt.labelEn}
                    cost={opt.sparkCost}
                    isSelected={isSelected}
                    isLocked={isLocked}
                    hairColor={outfit.hairColor}
                    outfitColor={outfit.outfitColor}
                    onTap={() =>
                      trySelect(opt.sparkCost, () =>
                        updateOutfit({ hairAccessory: opt.id as HairAccessory })
                      )
                    }
                  />
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Locked toast ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {lockedToast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                       px-5 py-3 rounded-2xl flex items-center gap-2"
            style={{
              background: 'rgba(45,42,74,0.95)',
              border: '1.5px solid rgba(245,158,11,0.4)',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-xl">🔒</span>
            <span
              className="text-white font-bold text-base"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              {isHe
                ? `צריך ${lockedToast.cost} ✨ כדי לפתוח!`
                : `Need ${lockedToast.cost} ✨ to unlock!`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── ColorSwatch ────────────────────────────────────────────────────────────────
interface SwatchProps {
  color: string
  label: string
  cost: number
  isSelected: boolean
  isLocked: boolean
  onTap: () => void
}

function ColorSwatch({ color, label, cost, isSelected, isLocked, onTap }: SwatchProps) {
  return (
    <motion.button
      whileTap={!isLocked ? { scale: 0.92 } : undefined}
      onClick={onTap}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl border"
      style={{
        background: isSelected
          ? `${color}22`
          : 'rgba(45,42,74,0.6)',
        borderColor: isSelected ? color : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 16px ${color}66` : 'none',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      {/* Color circle */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full"
          style={{
            background: color,
            filter: isLocked ? 'grayscale(0.7) brightness(0.6)' : 'none',
            boxShadow: isSelected ? `0 0 12px ${color}` : 'none',
          }}
        />
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center text-white text-lg"
          >
            ✓
          </motion.div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm">🔒</span>
            <span className="text-white/60 text-[9px] font-bold leading-none mt-0.5">{cost}✨</span>
          </div>
        )}
      </div>
      <span
        className="text-white/70 text-xs text-center leading-tight"
        style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
      >
        {label}
      </span>
    </motion.button>
  )
}

// ── AccessoryCard ──────────────────────────────────────────────────────────────
interface AccessoryCardProps {
  id: HairAccessory
  emoji: string
  label: string
  cost: number
  isSelected: boolean
  isLocked: boolean
  hairColor: string
  outfitColor: string
  onTap: () => void
}

function AccessoryCard({
  emoji, label, cost, isSelected, isLocked, hairColor, outfitColor, onTap,
}: AccessoryCardProps) {
  return (
    <motion.button
      whileTap={!isLocked ? { scale: 0.93 } : undefined}
      onClick={onTap}
      className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border"
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${hairColor}22, ${outfitColor}22)`
          : 'rgba(45,42,74,0.6)',
        borderColor: isSelected ? hairColor : 'rgba(255,255,255,0.08)',
        boxShadow: isSelected ? `0 0 16px ${hairColor}55` : 'none',
        opacity: isLocked ? 0.55 : 1,
      }}
    >
      <div className="relative">
        <span className="text-4xl" style={{ filter: isLocked ? 'grayscale(1) brightness(0.5)' : 'none' }}>
          {emoji}
        </span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-green-400
                       flex items-center justify-center text-white text-xs font-bold"
          >
            ✓
          </motion.div>
        )}
      </div>
      <span
        className="text-white/80 font-bold text-sm"
        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
      >
        {label}
      </span>
      {isLocked && (
        <span className="text-white/40 text-xs">🔒 {cost} ✨</span>
      )}
      {!isLocked && cost === 0 && (
        <span className="text-kpop-cyan text-xs font-bold">
          {label === 'None' || label === 'ללא' ? '' : '✓ חינם'}
        </span>
      )}
    </motion.button>
  )
}
