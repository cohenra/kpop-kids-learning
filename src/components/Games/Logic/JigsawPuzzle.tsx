import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { t } from '../../../i18n/strings'
import { GameShell } from '../GameShell'
import { useProgress } from '../../../hooks/useProgress'
import { Button } from '../../UI/Button'
import { shuffle } from '../../../data/logic'

// ─── Jigsaw Puzzle ─────────────────────────────────────────────────────────────
//
// Simple tap-to-place puzzle for kids:
// • The board shows empty silhouette slots, each with a unique emoji+number
// • The tray shows the same emoji pieces shuffled in a different order
// • Child taps a piece from the tray → it becomes selected (highlighted)
// • Then taps the matching slot on the board → snaps into place with animation
// • WRONG slot: gentle shake + stays unplaced
// • Completing all pieces → celebration

interface JigsawPuzzleProps {
  onComplete: (sparks: number) => void
  onBack: () => void
}

// Each puzzle has a set of themed pieces
interface PuzzlePiece {
  id: number
  emoji: string
  color: string
}

// Puzzle themes — each has gridSize² unique emojis
const PUZZLE_THEMES_AGE3: PuzzlePiece[][] = [
  [
    { id: 0, emoji: '🌟', color: '#F59E0B' },
    { id: 1, emoji: '🎤', color: '#EC4899' },
    { id: 2, emoji: '🎵', color: '#06B6D4' },
    { id: 3, emoji: '💖', color: '#D946EF' },
  ],
  [
    { id: 0, emoji: '🐱', color: '#EC4899' },
    { id: 1, emoji: '🌙', color: '#7C3AED' },
    { id: 2, emoji: '🦋', color: '#10B981' },
    { id: 3, emoji: '🌈', color: '#F59E0B' },
  ],
  [
    { id: 0, emoji: '🍎', color: '#F43F5E' },
    { id: 1, emoji: '🐶', color: '#F59E0B' },
    { id: 2, emoji: '🚀', color: '#8B5CF6' },
    { id: 3, emoji: '⭐', color: '#06B6D4' },
  ],
]

const PUZZLE_THEMES_AGE5: PuzzlePiece[][] = [
  [
    { id: 0, emoji: '🌟', color: '#F59E0B' },
    { id: 1, emoji: '🎤', color: '#EC4899' },
    { id: 2, emoji: '🎵', color: '#06B6D4' },
    { id: 3, emoji: '💖', color: '#D946EF' },
    { id: 4, emoji: '🎸', color: '#10B981' },
    { id: 5, emoji: '🏆', color: '#F43F5E' },
    { id: 6, emoji: '🌙', color: '#7C3AED' },
    { id: 7, emoji: '🦋', color: '#8B5CF6' },
    { id: 8, emoji: '🎀', color: '#F59E0B' },
  ],
  [
    { id: 0, emoji: '🐯', color: '#F59E0B' },
    { id: 1, emoji: '🌺', color: '#EC4899' },
    { id: 2, emoji: '🚀', color: '#8B5CF6' },
    { id: 3, emoji: '🦁', color: '#F59E0B' },
    { id: 4, emoji: '🎹', color: '#7C3AED' },
    { id: 5, emoji: '⭐', color: '#06B6D4' },
    { id: 6, emoji: '🌊', color: '#06B6D4' },
    { id: 7, emoji: '🐬', color: '#10B981' },
    { id: 8, emoji: '💎', color: '#D946EF' },
  ],
  [
    { id: 0, emoji: '🌸', color: '#EC4899' },
    { id: 1, emoji: '🎺', color: '#F59E0B' },
    { id: 2, emoji: '🐸', color: '#10B981' },
    { id: 3, emoji: '🌈', color: '#F59E0B' },
    { id: 4, emoji: '🦅', color: '#7C3AED' },
    { id: 5, emoji: '🍓', color: '#F43F5E' },
    { id: 6, emoji: '🎃', color: '#F59E0B' },
    { id: 7, emoji: '🐙', color: '#D946EF' },
    { id: 8, emoji: '🏔️', color: '#8B5CF6' },
  ],
]

interface TrayPiece extends PuzzlePiece {
  placed: boolean
}

const SPARKS_PER_PUZZLE = 40
const PUZZLES_PER_SESSION = 3

export function JigsawPuzzle({ onComplete, onBack }: JigsawPuzzleProps) {
  const { age, language, addSparks } = useApp()
  const { completeGame } = useProgress()
  const s = t(language)

  const themes = age === 3 ? PUZZLE_THEMES_AGE3 : PUZZLE_THEMES_AGE5
  const gridSize = age === 3 ? 2 : 3

  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [totalSparks, setTotalSparks] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [wrongSlot, setWrongSlot] = useState<number | null>(null)

  const solvedRef = useRef(0)
  const totalSparksRef = useRef(0)

  const currentTheme = themes[puzzleIdx % themes.length]

  // Board: slot id → placed piece id or null
  const [board, setBoard] = useState<(number | null)[]>(() => new Array(currentTheme.length).fill(null))
  // Tray: shuffled pieces not yet placed
  const [tray, setTray] = useState<TrayPiece[]>(() =>
    shuffle(currentTheme.map(p => ({ ...p, placed: false })))
  )

  const placedCount = board.filter(b => b !== null).length

  const handleTrayTap = (pieceId: number) => {
    if (celebrate) return
    setSelectedId(prev => prev === pieceId ? null : pieceId)
  }

  const handleSlotTap = (slotId: number) => {
    if (celebrate) return
    if (selectedId === null) return
    if (board[slotId] !== null) return // Already filled

    // Check: slotId must equal selectedId (piece matches its slot)
    if (selectedId === slotId) {
      // Correct!
      const newBoard = [...board]
      newBoard[slotId] = selectedId
      setBoard(newBoard)
      setTray(prev => prev.map(p => p.id === selectedId ? { ...p, placed: true } : p))
      setSelectedId(null)

      // Check puzzle complete
      if (newBoard.filter(v => v !== null).length === currentTheme.length) {
        onPuzzleComplete()
      }
    } else {
      // Wrong slot — shake it
      setWrongSlot(slotId)
      setSelectedId(null)
      setTimeout(() => setWrongSlot(null), 600)
    }
  }

  const onPuzzleComplete = useCallback(() => {
    setCelebrate(true)
    addSparks(SPARKS_PER_PUZZLE)
    totalSparksRef.current += SPARKS_PER_PUZZLE
    setTotalSparks(totalSparksRef.current)

    setTimeout(() => {
      setCelebrate(false)
      solvedRef.current += 1
      const next = solvedRef.current
      setSolvedCount(next)

      if (next >= PUZZLES_PER_SESSION) {
        completeGame('logic', 'jigsaw-puzzle')
        onComplete(totalSparksRef.current)
        setFinished(true)
      } else {
        const nextTheme = themes[(puzzleIdx + 1) % themes.length]
        setPuzzleIdx(prev => prev + 1)
        setBoard(new Array(nextTheme.length).fill(null))
        setTray(shuffle(nextTheme.map(p => ({ ...p, placed: false }))))
        setSelectedId(null)
      }
    }, 1800)
  }, [puzzleIdx, themes, addSparks, onComplete, completeGame])

  if (finished) {
    return (
      <GameShell title={language === 'he' ? 'פאזל' : 'Jigsaw Puzzle'} round={PUZZLES_PER_SESSION} totalRounds={PUZZLES_PER_SESSION} mood="excited" onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🧩</motion.div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
          <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(totalSparks))}</p>
          <Button onClick={onBack} className="mt-4">{s.back}</Button>
        </div>
      </GameShell>
    )
  }

  const cellSize = age === 3 ? 88 : 70
  const traySize = age === 3 ? 70 : 56

  return (
    <GameShell
      title={language === 'he' ? 'פאזל' : 'Jigsaw Puzzle'}
      round={solvedCount} totalRounds={PUZZLES_PER_SESSION}
      mood={celebrate ? 'excited' : selectedId !== null ? 'encouraging' : 'happy'}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-between p-3 text-white">
        {/* Header */}
        <div className="flex justify-between w-full text-sm text-white/50">
          <span>{language === 'he' ? `פאזל ${solvedCount + 1}/${PUZZLES_PER_SESSION}` : `Puzzle ${solvedCount + 1}/${PUZZLES_PER_SESSION}`}</span>
          <span>✨ {totalSparks}</span>
        </div>

        {/* Instruction */}
        <motion.p
          className="text-white/70 text-sm text-center"
          style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
          animate={{ opacity: selectedId !== null ? 1 : 0.5 }}
        >
          {selectedId !== null
            ? (language === 'he' ? '✅ עכשיו לחצי על המשבצת המתאימה!' : '✅ Now tap the matching slot!')
            : (language === 'he' ? '👇 בחרי חתיכה מלמטה!' : '👇 Pick a piece from below!')}
        </motion.p>

        {/* Board */}
        <div
          className="grid gap-2 p-3 rounded-3xl border-2 border-white/20"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          {currentTheme.map((piece, slotId) => {
            const placedPiece = board[slotId] !== null
              ? currentTheme.find(p => p.id === board[slotId])!
              : null
            const isWrong = wrongSlot === slotId
            const isTarget = selectedId !== null && !placedPiece

            return (
              <motion.button
                key={slotId}
                className="rounded-2xl border-2 flex items-center justify-center relative"
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: cellSize * 0.5,
                  background: placedPiece
                    ? placedPiece.color
                    : 'rgba(255,255,255,0.06)',
                  borderColor: isWrong
                    ? '#F87171'
                    : isTarget
                      ? 'rgba(245,158,11,0.8)'
                      : placedPiece
                        ? `${placedPiece.color}99`
                        : 'rgba(255,255,255,0.15)',
                  boxShadow: isTarget
                    ? '0 0 12px rgba(245,158,11,0.5)'
                    : placedPiece
                      ? `0 0 16px ${placedPiece.color}88`
                      : 'none',
                }}
                animate={
                  isWrong
                    ? { x: [-6, 6, -6, 6, 0], transition: { duration: 0.4 } }
                    : placedPiece
                      ? { scale: [1, 1.12, 1], transition: { duration: 0.3 } }
                      : {}
                }
                onClick={() => handleSlotTap(slotId)}
                whileTap={{ scale: placedPiece ? 1 : 0.93 }}
              >
                {placedPiece ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    {placedPiece.emoji}
                  </motion.span>
                ) : (
                  // Show silhouette: dimmed version of what belongs here
                  <span style={{ opacity: 0.2, fontSize: cellSize * 0.45 }}>
                    {piece.emoji}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Celebration overlay */}
        <AnimatePresence>
          {celebrate && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.p
                className="text-5xl font-bold text-center"
                style={{
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                  background: 'linear-gradient(90deg, #F59E0B, #EC4899)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: [1, 1.2, 1], y: 0 }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🎉 {s.amazing}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tray */}
        <div className="w-full">
          <p className="text-white/40 text-xs text-center mb-2">
            {language === 'he' ? `${placedCount}/${currentTheme.length} חתיכות` : `${placedCount}/${currentTheme.length} placed`}
          </p>
          <div className="flex flex-wrap gap-2 justify-center min-h-[80px] bg-white/5 rounded-3xl p-3 border border-white/10">
            {tray.filter(p => !p.placed).map(piece => (
              <motion.button
                key={piece.id}
                className="rounded-2xl border-2 flex items-center justify-center select-none touch-manipulation"
                style={{
                  width: traySize,
                  height: traySize,
                  fontSize: traySize * 0.5,
                  background: piece.color,
                  borderColor: selectedId === piece.id ? '#F59E0B' : `${piece.color}66`,
                  boxShadow: selectedId === piece.id
                    ? '0 0 20px rgba(245,158,11,0.8)'
                    : `0 4px 12px ${piece.color}44`,
                }}
                animate={{ scale: selectedId === piece.id ? 1.14 : 1 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleTrayTap(piece.id)}
              >
                {piece.emoji}
              </motion.button>
            ))}
            {tray.filter(p => !p.placed).length === 0 && (
              <p className="text-white/30 text-sm self-center">
                {language === 'he' ? 'כל החתיכות הונחו! 🎉' : 'All pieces placed! 🎉'}
              </p>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  )
}
