// ─── LetterTracer ─────────────────────────────────────────────────────────────
//
// Shared canvas component for tracing letters and numbers.
//
// HOW IT WORKS
//   1. On mount, the character is rendered to an off-screen canvas using the
//      system's actual font (canvas.fillText).  Every non-transparent pixel
//      becomes a "sample point" in SVG-coordinate space (100×140).
//   2. The child draws on the SVG with pointer events.  Drawn points are
//      accumulated across multiple finger lifts.
//   3. On each lift, coverage = fraction of sample points that have a drawn
//      point within TOLERANCE units.  Reaches MIN_COVERAGE → success.
//   4. The visual guide is an SVG <text> element rendering the same character,
//      so it ALWAYS looks like the real letter — in any script, any language.
//
// DEMO
//   A clipPath animates from top → bottom, revealing the character stroke by
//   stroke so the child can see what shape to trace.

import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import type { TracingItem } from '../../data/tracingData'

// ── Constants ──────────────────────────────────────────────────────────────────

// Proximity tolerance in SVG units (viewBox = 100×140).
// 8 units is roughly a finger-width — generous but requires real tracing.
const TOLERANCE    = 8

// Fraction of the character's ink pixels that must have a drawn point nearby.
const MIN_COVERAGE = 0.72

// Minimum total drawn points before we evaluate coverage at all.
// Prevents a single tap from accidentally triggering success.
const MIN_POINTS   = 20

const CANVAS_SIZE  = 280   // rendered px on screen

// Font used for BOTH the canvas rasterizer and the SVG guide text.
// Must match so scoring aligns with what the child sees.
const FONT_HE  = "'Heebo', 'Assistant', Arial, sans-serif"
const FONT_EN  = "'Nunito', 'Fredoka One', Arial, sans-serif"
const FONT_NUM = "'Nunito', 'Fredoka One', Arial, sans-serif"

// Character render parameters (in viewBox units = canvas pixels since canvas
// is created at exactly 100×140).
const CHAR_FONT_SIZE = 92     // px / viewBox units
const CHAR_BASELINE  = 115    // y-coordinate for alphabetic baseline

// ── Types ──────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }

type Phase = 'demo' | 'ready' | 'tracing' | 'done'

interface Props {
  item: TracingItem
  onSuccess: () => void
}

// ── Off-screen rasterization ──────────────────────────────────────────────────
//
// Returns at most MAX_SAMPLES points in viewBox space (0–100, 0–140).

const MAX_SAMPLES = 450

function rasterizeChar(char: string, fontFamily: string): Point[] {
  const W = 100, H = 140
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return []

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#ffffff'
  ctx.font = `${CHAR_FONT_SIZE}px ${fontFamily}`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(char, 50, CHAR_BASELINE)

  const data = ctx.getImageData(0, 0, W, H).data
  const all: Point[] = []
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 40) all.push({ x, y })
    }
  }

  // Uniform downsample
  if (all.length <= MAX_SAMPLES) return all
  const step = Math.ceil(all.length / MAX_SAMPLES)
  return all.filter((_, i) => i % step === 0)
}

// ── Derive start-dot position from ink pixels ─────────────────────────────────
// Hebrew starts at top-right; Latin/numbers start at top-left.

function deriveStart(pts: Point[], isHe: boolean): Point {
  if (pts.length === 0) return { x: 50, y: 24 }
  const minY = Math.min(...pts.map(p => p.y))
  const top  = pts.filter(p => p.y < minY + 20)
  if (top.length === 0) return { x: 50, y: 24 }
  return isHe
    ? top.reduce((mx, p) => (p.x > mx.x ? p : mx))
    : top.reduce((mn, p) => (p.x < mn.x ? p : mn))
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LetterTracer({ item, onSuccess }: Props) {
  const { isRTL } = useApp()
  const uid = useId()  // stable ID for the clipPath element

  const fontFamily =
    item.category === 'letter-he' ? FONT_HE
    : item.category === 'number'  ? FONT_NUM
    : FONT_EN

  const isHe = item.category === 'letter-he'

  const [phase,      setPhase]      = useState<Phase>('demo')
  const [inkPts,     setInkPts]     = useState<Point[]>([])
  const [startDot,   setStartDot]   = useState<Point>({ x: 50, y: 24 })
  const [drawn,      setDrawn]      = useState<Point[]>([])
  const [activePts,  setActivePts]  = useState<Point[]>([])
  const [isPressing, setIsPressing] = useState(false)
  const [coverage,   setCoverage]   = useState(0)

  const svgRef   = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Rasterize on item change ────────────────────────────────────────────────
  useEffect(() => {
    // Wait for fonts to be loaded so canvas uses the correct glyphs
    const run = () => {
      const pts = rasterizeChar(item.displayChar, fontFamily)
      setInkPts(pts)
      setStartDot(deriveStart(pts, isHe))
      setDrawn([])
      setActivePts([])
      setCoverage(0)
      setIsPressing(false)
      setPhase('demo')
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setPhase('ready'), 2200)
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(run)
    } else {
      run()
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [item.id, item.displayChar, fontFamily, isHe])

  // ── Coverage calculation ────────────────────────────────────────────────────
  const calcCoverage = useCallback((pts: Point[]): number => {
    if (inkPts.length === 0 || pts.length === 0) return 0
    const covered = inkPts.filter(s =>
      pts.some(d => (d.x - s.x) ** 2 + (d.y - s.y) ** 2 < TOLERANCE ** 2)
    )
    return covered.length / inkPts.length
  }, [inkPts])

  // ── Coordinate conversion ───────────────────────────────────────────────────
  const toSVG = useCallback((cx: number, cy: number): Point | null => {
    if (!svgRef.current) return null
    const r = svgRef.current.getBoundingClientRect()
    return {
      x: ((cx - r.left) / r.width)  * 100,
      y: ((cy - r.top)  / r.height) * 140,
    }
  }, [])

  // ── Pointer handlers ────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phase !== 'ready' && phase !== 'tracing') return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsPressing(true)
    setPhase('tracing')
    const pt = toSVG(e.clientX, e.clientY)
    if (pt) setActivePts([pt])
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPressing) return
    const pt = toSVG(e.clientX, e.clientY)
    if (!pt) return
    setActivePts(prev => {
      const next = [...prev, pt]
      setCoverage(calcCoverage([...drawn, ...next]))
      return next
    })
  }

  const onPointerUp = useCallback(() => {
    if (!isPressing) return
    setIsPressing(false)

    // Accumulate all lifts — child can lift and continue drawing
    const all = [...drawn, ...activePts]
    setDrawn(all)
    setActivePts([])

    // Not enough points yet — just keep drawing, no feedback
    if (all.length < MIN_POINTS) return

    const cov = calcCoverage(all)
    setCoverage(cov)

    if (cov >= MIN_COVERAGE) {
      setPhase('done')
      timerRef.current = setTimeout(onSuccess, 900)
    }
    // Below threshold: child keeps drawing — no penalty, no red X
  }, [isPressing, drawn, activePts, calcCoverage, onSuccess])

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDrawn([])
    setActivePts([])
    setCoverage(0)
    setPhase('ready')
    setIsPressing(false)
  }

  const pts2str = (pts: Point[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Stable clip-path id (avoids collision when multiple tracers on screen)
  const clipId = `clip-reveal-${uid.replace(/:/g, '')}`

  // ── Shared text props ───────────────────────────────────────────────────────
  const textBase = {
    x: 50,
    y: CHAR_BASELINE,
    fontSize: CHAR_FONT_SIZE,
    textAnchor: 'middle' as const,
    dominantBaseline: 'auto' as const,
    fontFamily,
    fontWeight: 'normal' as const,
    style: { userSelect: 'none' as const, pointerEvents: 'none' as const },
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          width: CANVAS_SIZE, height: CANVAS_SIZE,
          background: '#0E0C22',
          border: '2.5px solid',
          borderColor: phase === 'done' ? '#F59E0B' : 'rgba(124,58,237,0.45)',
          boxShadow: phase === 'done'
            ? '0 0 32px rgba(245,158,11,0.55)'
            : '0 0 20px rgba(124,58,237,0.22)',
          touchAction: 'none',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 100 140"
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0"
          style={{ touchAction: 'none', userSelect: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* ── Writing guidelines ─────────────────────────────────────────── */}
          <line x1="4" y1={item.topLine}  x2="96" y2={item.topLine}
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.9" />
          <line x1="4" y1={item.midLine}  x2="96" y2={item.midLine}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" strokeDasharray="3 5" />
          <line x1="4" y1={item.baseLine} x2="96" y2={item.baseLine}
            stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />

          {/* ── Demo: clipPath reveals the character top→bottom ────────────── */}
          {phase === 'demo' && (
            <>
              <defs>
                <clipPath id={clipId}>
                  <motion.rect
                    x="0" y="0" width="100"
                    initial={{ height: 0 }}
                    animate={{ height: 140 }}
                    transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.15 }}
                  />
                </clipPath>
              </defs>

              {/* Faint full outline so child can see the whole shape */}
              <text {...textBase}
                fill="none"
                stroke="rgba(255,255,255,0.10)"
                strokeWidth="1"
              >
                {item.displayChar}
              </text>

              {/* Animated pink reveal */}
              <text {...textBase}
                fill="#EC4899"
                fillOpacity={0.9}
                clipPath={`url(#${clipId})`}
              >
                {item.displayChar}
              </text>

              <motion.text
                x={isRTL ? 72 : 28} y={136}
                fontSize={8} textAnchor="middle"
                fontFamily="Fredoka One, Nunito, sans-serif"
                fill="rgba(236,72,153,0.65)"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {isRTL ? '👀 צפי... ואחר כך נסי!' : '👀 Watch... then try!'}
              </motion.text>
            </>
          )}

          {/* ── Steady guide character (ready / tracing / done) ────────────── */}
          {phase !== 'demo' && (
            <text {...textBase}
              fill={phase === 'done' ? 'rgba(245,158,11,0.30)' : 'rgba(255,255,255,0.18)'}
              stroke={phase === 'done' ? 'rgba(245,158,11,0.20)' : 'rgba(255,255,255,0.06)'}
              strokeWidth="0.6"
            >
              {item.displayChar}
            </text>
          )}

          {/* ── Start dot — pulsing green ───────────────────────────────────── */}
          {phase === 'ready' && inkPts.length > 0 && (
            <motion.circle
              cx={startDot.x}
              cy={startDot.y}
              r={5.5}
              fill="#22C55E"
              animate={{ r: [5.5, 8, 5.5], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}

          {/* ── Accumulated drawn path ──────────────────────────────────────── */}
          {drawn.length > 1 && phase !== 'done' && (
            <polyline
              points={pts2str(drawn)}
              fill="none" stroke="#EC4899"
              strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
              opacity={0.88}
            />
          )}

          {/* ── Live stroke being drawn right now ──────────────────────────── */}
          {activePts.length > 1 && (
            <polyline
              points={pts2str(activePts)}
              fill="none" stroke="#EC4899"
              strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
              opacity={0.95}
            />
          )}

          {/* ── Success: golden glow on the character ─────────────────────── */}
          {phase === 'done' && (
            <motion.text {...textBase}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              style={{
                ...textBase.style,
                filter: 'drop-shadow(0 0 10px #F59E0B)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {item.displayChar}
            </motion.text>
          )}
        </svg>

        {/* ── Coverage progress bar ────────────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
            animate={{ width: `${Math.round(coverage * 100)}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* ── Clear button ────────────────────────────────────────────────────── */}
      <motion.button
        className="flex items-center gap-2 px-6 py-3 rounded-2xl
                   bg-white/5 border border-white/15 text-white/55
                   font-bold text-base"
        style={{ minHeight: 52, fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        whileTap={{ scale: 0.92 }}
        onClick={handleClear}
      >
        🔄 {isRTL ? 'נקי ונסי שוב' : 'Clear & retry'}
      </motion.button>
    </div>
  )
}
