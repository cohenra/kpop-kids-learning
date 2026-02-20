import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { useAudio } from '../../../hooks/useAudio'
import { useProgress } from '../../../hooks/useProgress'
import { GameShell } from '../GameShell'
import { CelebrationOverlay } from '../CelebrationOverlay'
import { EncouragementOverlay } from '../EncouragementOverlay'
import {
  getWritingLetters,
  shuffle,
  SPARKS_PER_ROUND,
  SPARKS_COMPLETION_BONUS,
  ROUNDS_PER_GAME,
  type WritingLetter,
} from '../../../data/literacy'

// ─── Game 4: Finger Writing ────────────────────────────────────────────────────
//
// Show a dotted letter → child traces with finger
// Detect bounding-box coverage of the trace vs. the letter area
// Age 3: capital/first-4 only | Age 5: all 8 letters

interface Props {
  onComplete: (sparksEarned: number) => void
  onBack: () => void
}

interface Point { x: number; y: number }

const CANVAS_SIZE = 280
const MIN_COVERAGE = 0.30  // 30% of bounding box must be covered to count as correct

export function FingerWriting({ onComplete, onBack }: Props) {
  const { language, isRTL, age } = useApp()
  const { say, playCorrect, playWrong, playSpark } = useAudio()
  const { completeGame } = useProgress()

  const [letters] = useState<WritingLetter[]>(() =>
    shuffle(getWritingLetters(language, age)).slice(0, ROUNDS_PER_GAME)
  )
  const [roundIdx, setRoundIdx] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging'>('idle')
  const [totalSparks, setTotalSparks] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showEncouragement, setShowEncouragement] = useState(false)
  const [celebMessage, setCelebMessage] = useState('')
  const [fillProgress, setFillProgress] = useState(0)

  const svgRef = useRef<SVGSVGElement>(null)
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = letters[roundIdx]

  // Say letter name on mount + round change
  useEffect(() => {
    if (!current) return
    setStrokes([])
    setCurrentStroke([])
    setAnswerState('idle')
    setMood('thinking')
    setFillProgress(0)
    const timer = setTimeout(() => say(current.ttsName), 400)
    return () => {
      clearTimeout(timer)
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    }
  }, [roundIdx, current, say])

  // Convert screen coordinates to SVG coordinates
  const screenToSVG = useCallback((clientX: number, clientY: number): Point | null => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = 100 / rect.width   // viewBox is 0 0 100 120
    const scaleY = 120 / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  // Calculate what % of the letter area has been covered
  const evaluateCoverage = useCallback((allStrokes: Point[][]): number => {
    if (allStrokes.length === 0) return 0
    const allPoints = allStrokes.flat()
    if (allPoints.length < 3) return 0

    // Simple bounding box of drawn points
    const xs = allPoints.map((p) => p.x)
    const ys = allPoints.map((p) => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const drawnArea = (maxX - minX) * (maxY - minY)

    // Letter occupies roughly 60x90 of the 100x120 viewBox
    const letterArea = 60 * 90
    return Math.min(1, drawnArea / letterArea)
  }, [])

  const finishDrawing = useCallback((finalStrokes: Point[][]) => {
    if (answerState !== 'idle') return
    const coverage = evaluateCoverage(finalStrokes)
    setFillProgress(coverage)

    if (coverage >= MIN_COVERAGE) {
      // Correct!
      setAnswerState('correct')
      setMood('excited')
      playCorrect()

      const earned = SPARKS_PER_ROUND
      const newTotal = totalSparks + earned
      setTotalSparks(newTotal)

      const msgs = isRTL
        ? ['יפה! ✍️', 'מדהים! 🌟', 'כתבת אותה! ⭐']
        : ['Beautiful! ✍️', 'Amazing! 🌟', 'You wrote it! ⭐']
      setCelebMessage(msgs[Math.floor(Math.random() * msgs.length)])
      setShowCelebration(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowCelebration(false)
        playSpark()
        if (roundIdx + 1 >= ROUNDS_PER_GAME) {
          completeGame('literacy', 'finger-writing', 100)
          setTimeout(() => onComplete(newTotal + SPARKS_COMPLETION_BONUS), 600)
        } else {
          setRoundIdx((r) => r + 1)
        }
      }, 1500)
    } else if (finalStrokes.flat().length > 5) {
      // Not enough coverage — encourage
      setAnswerState('wrong')
      setMood('encouraging')
      playWrong()
      setShowEncouragement(true)

      autoAdvanceTimer.current = setTimeout(() => {
        setShowEncouragement(false)
        setStrokes([])
        setCurrentStroke([])
        setAnswerState('idle')
        setMood('thinking')
        setFillProgress(0)
        say(current.ttsName)
      }, 1600)
    }
  }, [
    answerState, evaluateCoverage, totalSparks, isRTL, roundIdx, current,
    playCorrect, playWrong, playSpark, say, completeGame, onComplete,
  ])

  // Touch / pointer events
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (answerState !== 'idle') return
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDrawing(true)
    const pt = screenToSVG(e.clientX, e.clientY)
    if (pt) setCurrentStroke([pt])
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || answerState !== 'idle') return
    const pt = screenToSVG(e.clientX, e.clientY)
    if (pt) setCurrentStroke((prev) => [...prev, pt])
  }

  const handlePointerUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const finalStrokes = [...strokes, currentStroke]
    setStrokes(finalStrokes)
    setCurrentStroke([])
    finishDrawing(finalStrokes)
  }

  const handleClear = () => {
    setStrokes([])
    setCurrentStroke([])
    setFillProgress(0)
    setAnswerState('idle')
    setMood('thinking')
  }

  // Build the SVG polyline string from points
  const pointsToPolyline = (pts: Point[]): string =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  if (!current) return null

  // Gradient fill based on coverage
  const fillGradientId = `fill-${roundIdx}`
  const coveragePct = Math.round(fillProgress * 100)

  return (
    <GameShell
      title={isRTL ? 'כתיבה באצבע' : 'Finger Writing'}
      round={roundIdx + 1}
      totalRounds={ROUNDS_PER_GAME}
      mood={mood}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-between px-4 pb-4 pt-1 relative">
        <CelebrationOverlay
          show={showCelebration}
          message={celebMessage}
          sparksEarned={SPARKS_PER_ROUND}
        />
        <EncouragementOverlay
          show={showEncouragement}
          message={isRTL ? 'נסי שוב! עקבי אחרי הנקודות' : 'Try again! Follow the dots'}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={current.letter}
            className="flex flex-col items-center gap-3 flex-1 justify-center w-full"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          >
            {/* Letter name + instructions */}
            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 px-3 py-2 rounded-full
                           bg-kpop-card/70 border border-kpop-cyan/30 text-kpop-cyan
                           font-bold text-base"
                whileTap={{ scale: 0.9 }}
                onClick={() => say(current.ttsName)}
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif', minHeight: 44 }}
              >
                🔊
              </motion.button>
              <span
                className="text-white/70 text-xl font-bold"
                style={{ fontFamily: 'Fredoka One, Nunito, Heebo, sans-serif' }}
              >
                {current.ttsName}
              </span>
            </div>

            <p className="text-white/50 text-base text-center"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL ? '✍️ עקבי אחרי האות באצבע' : '✍️ Trace the letter with your finger'}
            </p>

            {/* SVG drawing canvas */}
            <div
              className="relative rounded-3xl overflow-hidden border-2 border-kpop-purple/40"
              style={{
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                background: 'linear-gradient(135deg, rgba(45,42,74,0.9), rgba(30,27,46,0.95))',
                boxShadow: answerState === 'correct'
                  ? '0 0 40px rgba(245,158,11,0.5)'
                  : '0 0 20px rgba(124,58,237,0.2)',
                touchAction: 'none',
              }}
            >
              <svg
                ref={svgRef}
                viewBox={current.viewBox}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="absolute inset-0"
                style={{ touchAction: 'none', userSelect: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <defs>
                  <linearGradient id={fillGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>

                {/* Dotted guide path */}
                <path
                  d={current.svgPath}
                  stroke={answerState === 'correct' ? `url(#${fillGradientId})` : 'rgba(255,255,255,0.15)'}
                  strokeWidth={answerState === 'correct' ? 8 : 5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={answerState === 'correct' ? undefined : '4 6'}
                />

                {/* Guide dots (extra visual cue) */}
                {answerState === 'idle' && (
                  <path
                    d={current.svgPath}
                    stroke="rgba(124,58,237,0.4)"
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Fill overlay on correct */}
                {answerState === 'correct' && (
                  <motion.path
                    d={current.svgPath}
                    stroke={`url(#${fillGradientId})`}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0.5 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )}

                {/* User strokes — render all finished strokes */}
                {strokes.map((stroke, si) => (
                  stroke.length > 1 && (
                    <polyline
                      key={si}
                      points={pointsToPolyline(stroke)}
                      fill="none"
                      stroke={answerState === 'correct' ? `url(#${fillGradientId})` : '#EC4899'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={answerState === 'correct' ? 0.6 : 0.85}
                    />
                  )
                ))}

                {/* Current active stroke */}
                {currentStroke.length > 1 && (
                  <polyline
                    points={pointsToPolyline(currentStroke)}
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.9}
                  />
                )}

                {/* Letter label (faint, bottom-right) */}
                <text
                  x="85"
                  y="115"
                  fontSize="10"
                  fill="rgba(255,255,255,0.2)"
                  textAnchor="end"
                  style={{ fontFamily: 'Fredoka One, sans-serif' }}
                >
                  {current.displayLetter}
                </text>
              </svg>

              {/* Coverage bar */}
              <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #EC4899)' }}
                  animate={{ width: `${coveragePct}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Clear & Try Again buttons */}
            <div className="flex gap-3 w-full justify-center">
              <motion.button
                className="flex items-center gap-2 px-5 py-3 rounded-2xl
                           bg-kpop-card/70 border border-white/20 text-white/60
                           font-bold text-base min-h-[52px]"
                whileTap={{ scale: 0.92 }}
                onClick={handleClear}
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                🔄 {isRTL ? 'נקי' : 'Clear'}
              </motion.button>

              <motion.button
                className="flex items-center gap-2 px-5 py-3 rounded-2xl
                           bg-kpop-card/70 border border-kpop-cyan/30 text-kpop-cyan
                           font-bold text-base min-h-[52px]"
                whileTap={{ scale: 0.92 }}
                onClick={() => say(current.ttsName)}
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                🔊 {isRTL ? 'שמעי' : 'Hear'}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
