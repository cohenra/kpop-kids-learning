// ─── LetterTracer ─────────────────────────────────────────────────────────────
//
// Shared canvas component for tracing letters and numbers.
//
// Features:
//   • Writing guidelines (top / mid / base lines, like school paper)
//   • Animated demo: guide path draws itself (1.4s) before child traces
//   • Pulsing green start-dot shows exactly where to begin
//   • Direction arrow shows which way to go
//   • Distance-to-path scoring — measures actual proximity to the guide,
//     not just bounding-box coverage
//   • Multi-stroke support: shows one stroke at a time in correct order
//   • Completed strokes stay on canvas (faded gold) for context
//
// Usage:
//   <LetterTracer item={tracingItem} onSuccess={() => ...} />

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import type { TracingItem } from '../../data/tracingData'

// ── Constants ──────────────────────────────────────────────────────────────────

// Proximity tolerance in SVG units (viewBox is 100×140).
// 9 units ≈ a finger-width; generous but not trivially easy.
const TOLERANCE = 9

// Fraction of the path that must be covered to pass.
// 72% prevents a single random line from accidentally succeeding.
const MIN_COVERAGE = 0.72

// Minimum accumulated drawn points before we check coverage at all.
// Prevents instant success from an accidental tap or tiny doodle.
const MIN_POINTS = 18

const CANVAS_SIZE = 280

// ── Types ──────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }

interface ArrowData { x: number; y: number; angleDeg: number }

type Phase = 'demo' | 'ready' | 'tracing' | 'stroke-ok'

interface Props {
  item: TracingItem
  onSuccess: () => void   // called when all strokes pass
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LetterTracer({ item, onSuccess }: Props) {
  const { isRTL } = useApp()

  const [strokeIdx,   setStrokeIdx]   = useState(0)
  const [phase,       setPhase]       = useState<Phase>('demo')
  const [drawn,       setDrawn]       = useState<Point[]>([])
  const [activePts,   setActivePts]   = useState<Point[]>([])
  const [isPressing,  setIsPressing]  = useState(false)
  const [doneStrokes, setDoneStrokes] = useState<Point[][]>([])
  const [pathSamples, setPathSamples] = useState<Point[]>([])
  const [arrow,       setArrow]       = useState<ArrowData | null>(null)
  const [coverage,    setCoverage]    = useState(0)

  const svgRef       = useRef<SVGSVGElement>(null)
  const guideRef     = useRef<SVGPathElement>(null)  // hidden path for measurement
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stroke = item.strokes[strokeIdx]
  const isLast = strokeIdx === item.strokes.length - 1

  // ── Sample path once per stroke ──────────────────────────────────────────────
  useEffect(() => {
    const sample = () => {
      const el = guideRef.current
      if (!el) return
      try {
        const len = el.getTotalLength()
        if (len === 0) return
        const n    = Math.max(40, Math.ceil(len / 2))
        const pts: Point[] = []
        for (let i = 0; i <= n; i++) {
          const p = el.getPointAtLength((i / n) * len)
          pts.push({ x: p.x, y: p.y })
        }
        setPathSamples(pts)

        // Arrow at 55% along the path
        const t1 = el.getPointAtLength(0.55 * len)
        const t2 = el.getPointAtLength(Math.min(0.59 * len, len))
        setArrow({
          x: t1.x,
          y: t1.y,
          angleDeg: Math.atan2(t2.y - t1.y, t2.x - t1.x) * (180 / Math.PI),
        })
      } catch {
        /* path not yet in DOM — will retry */
      }
    }
    // Short delay ensures the hidden <path> is mounted
    const id = setTimeout(sample, 60)
    return () => clearTimeout(id)
  }, [item.id, strokeIdx])

  // ── Phase transition: demo → ready ───────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPhase('demo')
    setDrawn([])
    setActivePts([])
    setIsPressing(false)
    setCoverage(0)
    if (strokeIdx === 0) setDoneStrokes([])

    timerRef.current = setTimeout(() => setPhase('ready'), 1900)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [item.id, strokeIdx])

  // ── Coordinate conversion ─────────────────────────────────────────────────────
  const toSVG = useCallback((clientX: number, clientY: number): Point | null => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const [,,vw, vh] = item.viewBox.split(' ').map(Number)
    return {
      x: ((clientX - rect.left) / rect.width)  * vw,
      y: ((clientY - rect.top)  / rect.height) * vh,
    }
  }, [item.viewBox])

  // ── Coverage calculation ──────────────────────────────────────────────────────
  const calcCoverage = useCallback((pts: Point[]): number => {
    if (pathSamples.length === 0 || pts.length === 0) return 0
    const covered = pathSamples.filter(s =>
      pts.some(d => Math.hypot(d.x - s.x, d.y - s.y) < TOLERANCE)
    )
    return covered.length / pathSamples.length
  }, [pathSamples])

  // ── Pointer handlers ──────────────────────────────────────────────────────────
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
      // Update live coverage bar without blocking
      const all = [...drawn, ...next]
      setCoverage(calcCoverage(all))
      return next
    })
  }

  const onPointerUp = useCallback(() => {
    if (!isPressing) return
    setIsPressing(false)

    // Merge the active stroke into accumulated drawn points for this stroke.
    // This means children can lift their finger and continue — all lifts
    // within a single "stroke" are combined before evaluation.
    const all = [...drawn, ...activePts]
    setDrawn(all)
    setActivePts([])

    // Need enough points to form a meaningful trace before evaluating.
    if (all.length < MIN_POINTS) return

    const cov = calcCoverage(all)
    setCoverage(cov)

    // Only celebrate when the child has genuinely covered most of the path.
    // Low coverage just lets them keep drawing — no penalty, no red X.
    if (cov >= MIN_COVERAGE) {
      setPhase('stroke-ok')
      setDoneStrokes(prev => [...prev, all])

      timerRef.current = setTimeout(() => {
        if (isLast) {
          onSuccess()
        } else {
          setStrokeIdx(i => i + 1)
          setDrawn([])
          setCoverage(0)
        }
      }, 900)
    }
    // Below threshold → child keeps drawing on the same canvas.
    // The progress bar shows them how close they are.
  }, [isPressing, drawn, activePts, calcCoverage, isLast, onSuccess])

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDrawn([])
    setActivePts([])
    setCoverage(0)
    setPhase('ready')
    setIsPressing(false)
  }

  // ── Polyline helper ───────────────────────────────────────────────────────────
  const pts2str = (pts: Point[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const [,,vbW, vbH] = item.viewBox.split(' ').map(Number)

  return (
    <div className="flex flex-col items-center gap-3 w-full select-none">

      {/* ── Canvas ─────────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          width: CANVAS_SIZE, height: CANVAS_SIZE,
          background: '#0E0C22',
          border: '2.5px solid',
          borderColor: phase === 'stroke-ok' ? '#F59E0B' : 'rgba(124,58,237,0.45)',
          boxShadow: phase === 'stroke-ok'
            ? '0 0 32px rgba(245,158,11,0.55)'
            : '0 0 20px rgba(124,58,237,0.22)',
          touchAction: 'none',
          transition: 'border-color 0.25s, box-shadow 0.25s',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={item.viewBox}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute inset-0"
          style={{ touchAction: 'none', userSelect: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* ── Writing guidelines ─────────────────────────────────────── */}
          {/* top line — solid thin */}
          <line x1="4" y1={item.topLine}  x2={vbW - 4} y2={item.topLine}
            stroke="rgba(255,255,255,0.13)" strokeWidth="0.9" />
          {/* mid line — dashed */}
          <line x1="4" y1={item.midLine}  x2={vbW - 4} y2={item.midLine}
            stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" strokeDasharray="3 5" />
          {/* base line — slightly brighter */}
          <line x1="4" y1={item.baseLine} x2={vbW - 4} y2={item.baseLine}
            stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" />

          {/* ── Hidden measurement path ─────────────────────────────────── */}
          <path
            ref={guideRef}
            d={stroke.path}
            fill="none" stroke="none"
            style={{ visibility: 'hidden', pointerEvents: 'none' }}
          />

          {/* ── Context: other strokes (very faint) ────────────────────── */}
          {item.strokes.map((s, si) => si !== strokeIdx && (
            <path key={`ctx-${si}`}
              d={s.path}
              fill="none" stroke="rgba(255,255,255,0.05)"
              strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="4 7"
            />
          ))}

          {/* ── Current stroke dotted guide ─────────────────────────────── */}
          <path
            d={stroke.path}
            fill="none"
            stroke={phase === 'stroke-ok' ? '#F59E0B' : 'rgba(255,255,255,0.22)'}
            strokeWidth={phase === 'stroke-ok' ? 7 : 5.5}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={phase === 'stroke-ok' ? undefined : '5 8'}
          />

          {/* ── Demo animation: path draws itself ──────────────────────── */}
          {phase === 'demo' && (
            <motion.path
              d={stroke.path}
              fill="none" stroke="#EC4899"
              strokeWidth={7}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.95 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
          )}

          {/* ── Success fill animation ──────────────────────────────────── */}
          {phase === 'stroke-ok' && (
            <motion.path
              d={stroke.path}
              fill="none" stroke="#F59E0B"
              strokeWidth={8}
              strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55 }}
            />
          )}

          {/* ── Direction arrow ─────────────────────────────────────────── */}
          {(phase === 'ready' || phase === 'tracing') && arrow && (
            <g
              transform={`translate(${arrow.x},${arrow.y}) rotate(${arrow.angleDeg})`}
              opacity={0.55}
            >
              <polygon points="-6,-3.5 4,0 -6,3.5" fill="#06B6D4" />
            </g>
          )}

          {/* ── Start dot — pulsing green circle ───────────────────────── */}
          {phase === 'ready' && (
            <motion.circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r={5.5}
              fill="#22C55E"
              animate={{ r: [5.5, 8, 5.5], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          )}

          {/* ── Completed strokes (gold, faded) ────────────────────────── */}
          {doneStrokes.map((pts, si) =>
            pts.length > 1 && (
              <polyline key={`done-${si}`}
                points={pts2str(pts)}
                fill="none" stroke="#F59E0B"
                strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                opacity={0.45}
              />
            )
          )}

          {/* ── Current accumulated drawn path ──────────────────────────── */}
          {drawn.length > 1 && phase !== 'stroke-ok' && (
            <polyline
              points={pts2str(drawn)}
              fill="none" stroke="#EC4899"
              strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
              opacity={0.88}
            />
          )}

          {/* ── Live stroke being drawn right now ──────────────────────── */}
          {activePts.length > 1 && (
            <polyline
              points={pts2str(activePts)}
              fill="none" stroke="#EC4899"
              strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"
              opacity={0.95}
            />
          )}

          {/* ── Stroke counter (top-right, only for multi-stroke letters) ─ */}
          {item.strokes.length > 1 && (
            <text
              x={vbW - 4} y={item.topLine - 3}
              fontSize="9" fill="rgba(255,255,255,0.35)"
              textAnchor="end"
              fontFamily="Fredoka One, Nunito, sans-serif"
            >
              {strokeIdx + 1}/{item.strokes.length}
            </text>
          )}

          {/* ── "Watch then try" hint during demo ──────────────────────── */}
          {phase === 'demo' && (
            <motion.text
              x={vbW / 2} y={vbH - 4}
              fontSize="8.5" fill="rgba(236,72,153,0.65)"
              textAnchor="middle"
              fontFamily="Fredoka One, Nunito, sans-serif"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {isRTL ? '👀 צפי... ואחר כך נסי!' : '👀 Watch... then try!'}
            </motion.text>
          )}
        </svg>

        {/* ── Coverage progress bar ──────────────────────────────────────── */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
            animate={{ width: `${Math.round(coverage * 100)}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>
      </div>

      {/* ── Clear button ──────────────────────────────────────────────────── */}
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
