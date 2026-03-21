import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

// ─── DrawingRoom ──────────────────────────────────────────────────────────────
//
// Kids color K-POP themed outlines with their finger.
//
// Canvas (300×300 internal) under an SVG overlay (pointer-events: none).
// Pointer events scale coordinates from CSS display size → canvas pixels.
//
// Layout:
//   top bar  →  page selector tabs
//   canvas area  (canvas + SVG overlay stacked)
//   color palette row
//   brush size + clear + done buttons

const CANVAS_SIZE = 300   // internal canvas resolution
const SPARK_REWARD = 15

// ─── K-POP color palette ──────────────────────────────────────────────────────
const PALETTE = [
  '#EC4899', // hot pink
  '#7C3AED', // deep purple
  '#06B6D4', // cyan
  '#F59E0B', // gold
  '#10B981', // green
  '#F43F5E', // rose-red
  '#8B5CF6', // violet
  '#F97316', // orange
  '#FBBF24', // yellow
  '#3B82F6', // blue
  '#ffffff',  // white
  '#1a0a2e',  // dark navy
]

// ─── Coloring page outlines (SVG paths, viewBox 0 0 200 200) ─────────────────

interface PageDef {
  id: string
  titleHe: string
  titleEn: string
  emoji: string
  outline: React.ReactNode   // SVG children, no fill, black stroke
}

const STROKE = { fill: 'none', stroke: '#1a0a2e', strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
const STROKE_THIN = { ...STROKE, strokeWidth: 2.5 }

const PAGES: PageDef[] = [
  {
    id: 'star',
    titleHe: 'כוכב קסום',
    titleEn: 'Magic Star',
    emoji: '⭐',
    outline: (
      <g>
        {/* 5-pointed star */}
        <path d="M 100 18 L 122 76 L 184 76 L 133 113 L 153 171 L 100 136 L 47 171 L 67 113 L 16 76 L 78 76 Z" {...STROKE} />
        {/* Sparkles around */}
        <path d="M 30 30 L 33 24 L 36 30 L 30 30" {...STROKE_THIN} />
        <path d="M 33 24 L 33 18" {...STROKE_THIN} />
        <path d="M 29 21 L 37 27" {...STROKE_THIN} />
        <path d="M 170 25 L 173 19 L 176 25 L 170 25" {...STROKE_THIN} />
        <path d="M 173 19 L 173 13" {...STROKE_THIN} />
      </g>
    ),
  },
  {
    id: 'mic',
    titleHe: 'מיקרופון כוכבת',
    titleEn: 'Star Microphone',
    emoji: '🎤',
    outline: (
      <g>
        {/* Capsule */}
        <path d="M 72 35 Q 72 10 100 10 Q 128 10 128 35 L 128 88 Q 128 112 100 112 Q 72 112 72 88 Z" {...STROKE} />
        {/* Grille lines */}
        <line x1="74" y1="55" x2="126" y2="55" {...STROKE_THIN} />
        <line x1="72" y1="75" x2="128" y2="75" {...STROKE_THIN} />
        {/* Handle */}
        <rect x="90" y="112" width="20" height="52" rx="6" {...STROKE} />
        {/* Stand base */}
        <path d="M 68 164 Q 55 178 62 188 L 138 188 Q 145 178 132 164 Z" {...STROKE} />
        {/* Stars on capsule */}
        <path d="M 100 35 L 103 44 L 112 44 L 105 50 L 108 59 L 100 53 L 92 59 L 95 50 L 88 44 L 97 44 Z" {...STROKE_THIN} />
      </g>
    ),
  },
  {
    id: 'crown',
    titleHe: 'כתר מלכה',
    titleEn: 'Queen Crown',
    emoji: '👑',
    outline: (
      <g>
        {/* Crown body */}
        <path d="M 18 152 L 38 82 L 68 118 L 100 42 L 132 118 L 162 82 L 182 152 Z" {...STROKE} />
        {/* Base band */}
        <rect x="18" y="152" width="164" height="30" rx="6" {...STROKE} />
        {/* Center gem */}
        <circle cx="100" cy="54" r="13" {...STROKE} />
        <circle cx="100" cy="54" r="6" {...STROKE_THIN} />
        {/* Side gems */}
        <circle cx="44" cy="91" r="9" {...STROKE} />
        <circle cx="156" cy="91" r="9" {...STROKE} />
        {/* Small gems on band */}
        <circle cx="68" cy="167" r="5" {...STROKE_THIN} />
        <circle cx="100" cy="167" r="5" {...STROKE_THIN} />
        <circle cx="132" cy="167" r="5" {...STROKE_THIN} />
      </g>
    ),
  },
  {
    id: 'butterfly',
    titleHe: 'פרפר יפה',
    titleEn: 'Pretty Butterfly',
    emoji: '🦋',
    outline: (
      <g>
        {/* Left upper wing */}
        <path d="M 97 95 C 85 72 44 28 18 50 C 8 72 30 112 97 108 Z" {...STROKE} />
        {/* Left lower wing */}
        <path d="M 97 108 C 65 118 28 108 22 132 C 16 158 58 164 97 132 Z" {...STROKE} />
        {/* Right upper wing */}
        <path d="M 103 95 C 115 72 156 28 182 50 C 192 72 170 112 103 108 Z" {...STROKE} />
        {/* Right lower wing */}
        <path d="M 103 108 C 135 118 172 108 178 132 C 184 158 142 164 103 132 Z" {...STROKE} />
        {/* Body */}
        <ellipse cx="100" cy="112" rx="6" ry="24" {...STROKE} />
        {/* Antennae */}
        <path d="M 96 90 Q 78 64 68 53" {...STROKE_THIN} />
        <circle cx="67" cy="52" r="5" {...STROKE_THIN} />
        <path d="M 104 90 Q 122 64 132 53" {...STROKE_THIN} />
        <circle cx="133" cy="52" r="5" {...STROKE_THIN} />
        {/* Wing patterns */}
        <circle cx="62" cy="80" r="10" {...STROKE_THIN} />
        <circle cx="138" cy="80" r="10" {...STROKE_THIN} />
      </g>
    ),
  },
  {
    id: 'flower',
    titleHe: 'פרח קסום',
    titleEn: 'Magic Flower',
    emoji: '🌸',
    outline: (
      <g>
        {/* Petals — 6 petals via rotation */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="100" cy="68" rx="18" ry="32"
            transform={`rotate(${angle} 100 100)`}
            {...STROKE}
          />
        ))}
        {/* Center circle */}
        <circle cx="100" cy="100" r="22" {...STROKE} />
        <circle cx="100" cy="100" r="10" {...STROKE_THIN} />
        {/* Stem */}
        <line x1="100" y1="122" x2="100" y2="185" {...{ ...STROKE, strokeWidth: 5 }} />
        {/* Leaves */}
        <path d="M 100 158 Q 72 148 68 136 Q 80 155 100 158 Z" {...STROKE} />
        <path d="M 100 158 Q 128 148 132 136 Q 120 155 100 158 Z" {...STROKE} />
      </g>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function DrawingRoom() {
  const navigate  = useNavigate()
  const { language, addSparks, backArrow } = useApp()
  const isHe = language === 'he'

  const [pageIdx, setPageIdx]     = useState(0)
  const [color, setColor]         = useState(PALETTE[0])
  const [brushSize, setBrushSize] = useState(14)
  const [isDone, setIsDone]       = useState(false)
  const [showDone, setShowDone]   = useState(false)
  const sparksGivenRef            = useRef(false)

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const paintingRef = useRef(false)
  const lastPos     = useRef<{ x: number; y: number } | null>(null)

  // Clear canvas when page changes
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    setShowDone(false)
  }, [pageIdx])

  // ── Coordinate scaling: CSS pixels → canvas pixels ────────────────────────
  const getCoords = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width)  * CANVAS_SIZE,
      y: ((e.clientY - rect.top)  / rect.height) * CANVAS_SIZE,
    }
  }, [])

  // ── Paint stroke ───────────────────────────────────────────────────────────
  const paint = useCallback((x: number, y: number) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = color

    if (lastPos.current) {
      // Interpolate between last and current point for a smooth stroke
      const dx = x - lastPos.current.x
      const dy = y - lastPos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(1, Math.ceil(dist / (brushSize * 0.4)))
      for (let i = 0; i <= steps; i++) {
        const px = lastPos.current.x + (dx * i) / steps
        const py = lastPos.current.y + (dy * i) / steps
        ctx.beginPath()
        ctx.arc(px, py, brushSize, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      ctx.beginPath()
      ctx.arc(x, y, brushSize, 0, Math.PI * 2)
      ctx.fill()
    }
    lastPos.current = { x, y }
    setShowDone(true)   // show the Done button once they start painting
  }, [color, brushSize])

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    paintingRef.current = true
    lastPos.current = null
    const { x, y } = getCoords(e)
    paint(x, y)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!paintingRef.current) return
    const { x, y } = getCoords(e)
    paint(x, y)
  }
  const onPointerUp = () => {
    paintingRef.current = false
    lastPos.current = null
  }

  // ── Clear canvas ───────────────────────────────────────────────────────────
  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    setShowDone(false)
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  const handleDone = () => {
    if (!sparksGivenRef.current) {
      sparksGivenRef.current = true
      addSparks(SPARK_REWARD)
    }
    setIsDone(true)
  }

  const page = PAGES[pageIdx]

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #0D0A1E 100%)' }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
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
          {isHe ? '🎨 חדר הציור' : '🎨 Drawing Room'}
        </h1>

        {/* Clear button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={clearCanvas}
          className="w-11 h-11 flex items-center justify-center rounded-full
                     bg-white/10 text-white text-xl border border-white/10"
        >
          🗑️
        </motion.button>
      </div>

      {/* ── Page selector tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 mb-2 overflow-x-auto scrollable">
        {PAGES.map((p, i) => (
          <motion.button
            key={p.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPageIdx(i)}
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border"
            style={{
              background: i === pageIdx
                ? 'linear-gradient(135deg, #7C3AED, #EC4899)'
                : 'rgba(45,42,74,0.8)',
              borderColor: i === pageIdx ? 'transparent' : 'rgba(255,255,255,0.1)',
              boxShadow: i === pageIdx ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {p.emoji}
          </motion.button>
        ))}
      </div>

      {/* ── Canvas area ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            width: 'min(calc(100vw - 32px), 340px)',
            aspectRatio: '1',
            background: 'white',
            boxShadow: '0 0 30px rgba(124,58,237,0.3)',
          }}
        >
          {/* Paint canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0 w-full h-full touch-none"
            style={{ zIndex: 1 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />

          {/* SVG outline overlay — pointer-events: none so paint goes to canvas */}
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 2, pointerEvents: 'none' }}
          >
            {page.outline}
          </svg>
        </div>
      </div>

      {/* ── Color palette ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {PALETTE.map((c) => (
            <motion.button
              key={c}
              whileTap={{ scale: 0.85 }}
              onClick={() => setColor(c)}
              className="rounded-full border-2 transition-all"
              style={{
                width: 32, height: 32,
                background: c,
                borderColor: color === c ? '#ffffff' : 'rgba(255,255,255,0.15)',
                boxShadow: color === c ? `0 0 10px ${c}, 0 0 0 2px white` : 'none',
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Brush size + Done ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 pb-5 safe-bottom gap-3">
        {/* Brush sizes */}
        <div className="flex items-center gap-3">
          {[8, 14, 22].map((size) => (
            <motion.button
              key={size}
              whileTap={{ scale: 0.9 }}
              onClick={() => setBrushSize(size)}
              className="flex items-center justify-center rounded-full border-2"
              style={{
                width: 40, height: 40,
                borderColor: brushSize === size ? color : 'rgba(255,255,255,0.2)',
                background: brushSize === size ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: size * 1.2,
                  height: size * 1.2,
                  background: color,
                  opacity: brushSize === size ? 1 : 0.4,
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Done button — appears after first stroke */}
        <AnimatePresence>
          {showDone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="px-5 py-3 rounded-2xl font-bold text-white text-base
                         flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                fontFamily: 'Fredoka One, Nunito, sans-serif',
                minWidth: 120,
              }}
            >
              🎉 {isHe ? 'סיימתי!' : 'Done!'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Celebration overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 gap-5"
            style={{ background: 'rgba(13,10,30,0.92)' }}
          >
            {/* Big emoji bounce */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [-5, 5, -5, 0] }}
              transition={{ duration: 0.7, repeat: 3 }}
              className="text-8xl"
            >
              {page.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2
                className="text-kpop-gold font-bold text-2xl mb-2"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isHe ? '🎨 יצירת מופת!' : '🎨 Masterpiece!'}
              </h2>
              <p
                className="text-kpop-cyan font-bold text-lg"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                +{SPARK_REWARD} ✨
              </p>
            </motion.div>

            <div className="flex flex-col gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  clearCanvas()
                  sparksGivenRef.current = false
                  setIsDone(false)
                  // Move to next page
                  setPageIdx((i) => (i + 1) % PAGES.length)
                }}
                className="w-full py-4 rounded-2xl font-bold text-white text-xl
                           flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                }}
              >
                🎨 {isHe ? 'ציור חדש!' : 'New Drawing!'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/home')}
                className="w-full py-3 rounded-2xl font-bold text-white/60 text-base border border-white/15"
                style={{
                  background: 'rgba(45,42,74,0.7)',
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                }}
              >
                {backArrow} {isHe ? 'חזרה הביתה' : 'Back Home'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
