import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { t } from '../../../i18n/strings'
import { GameShell } from '../GameShell'
import { useProgress } from '../../../hooks/useProgress'
import { Button } from '../../UI/Button'
import { speak } from '../../../utils/tts'
import {
    ODD_ONE_OUT_ROUNDS_AGE_3,
    ODD_ONE_OUT_ROUNDS_AGE_5,
    shuffle,
} from '../../../data/logic'

interface OddOneOutProps {
    onComplete: (sparks: number) => void
    onBack: () => void
}

const SPARKS_PER_CORRECT = 10
const TOTAL_ROUNDS = 10

export function OddOneOut({ onComplete, onBack }: OddOneOutProps) {
    const { age, language, addSparks } = useApp()
    const { completeGame } = useProgress()
    const s = t(language)

    const [rounds] = useState(() =>
        age === 3
            ? shuffle([...ODD_ONE_OUT_ROUNDS_AGE_3])
            : shuffle([...ODD_ONE_OUT_ROUNDS_AGE_5])
    )

    const [roundIndex, setRoundIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [gameState, setGameState] = useState<'playing' | 'answered' | 'finished'>('playing')

    const currentRound = rounds[roundIndex % rounds.length]

    const speakQuestion = useCallback(() => {
        const q = language === 'he' ? currentRound.questionHe : currentRound.questionEn
        speak(q, language)
    }, [currentRound, language])

    useEffect(() => {
        const timer = setTimeout(speakQuestion, 600)
        return () => clearTimeout(timer)
    }, [roundIndex, speakQuestion])

    const handleAnswer = (index: number) => {
        if (gameState === 'answered') return
        setSelected(index)
        const correct = index === currentRound.correctIndex
        if (correct) setScore(prev => prev + 1)
        setGameState('answered')
    }

    const nextRound = () => {
        if (roundIndex + 1 >= TOTAL_ROUNDS) {
            const sparksEarned = score * SPARKS_PER_CORRECT
            addSparks(sparksEarned)
            completeGame('logic', 'odd-one-out')
            onComplete(sparksEarned)
            setGameState('finished')
        } else {
            setRoundIndex(prev => prev + 1)
            setSelected(null)
            setGameState('playing')
        }
    }

    if (gameState === 'finished') {
        return (
            <GameShell
                title={language === 'he' ? 'מה לא שייך?' : 'Odd One Out'}
                round={TOTAL_ROUNDS} totalRounds={TOTAL_ROUNDS} mood="excited" onBack={onBack}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🤔</motion.div>
                    <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
                    <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(score * SPARKS_PER_CORRECT))}</p>
                    <p className="text-white/50 text-sm">{score} / {TOTAL_ROUNDS} {language === 'he' ? 'נכון' : 'correct'}</p>
                    <Button onClick={onBack} className="mt-4">{s.back}</Button>
                </div>
            </GameShell>
        )
    }

    const isCorrect = selected === currentRound.correctIndex

    return (
        <GameShell
            title={language === 'he' ? 'מה לא שייך?' : 'Odd One Out'}
            round={roundIndex} totalRounds={TOTAL_ROUNDS}
            mood={gameState === 'answered' ? (isCorrect ? 'excited' : 'encouraging') : 'thinking'}
            onBack={onBack}
        >
            <div className="flex-1 flex flex-col items-center justify-between p-4 text-white">
                <div className="w-full flex items-center justify-between">
                    <p className="text-white/50 text-sm">{s.round} {roundIndex + 1} / {TOTAL_ROUNDS}</p>
                    <p className="text-kpop-gold font-bold">{s.score}: {score}</p>
                </div>

                <motion.div key={roundIndex} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <motion.button
                        className="text-2xl font-bold mb-2 bg-white/10 rounded-2xl px-4 py-2 border border-white/20"
                        style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={speakQuestion}
                    >
                        🔊 {language === 'he' ? currentRound.questionHe : currentRound.questionEn}
                    </motion.button>
                </motion.div>

                <motion.div
                    key={`choices-${roundIndex}`}
                    className="grid grid-cols-2 gap-4 w-full max-w-sm"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                >
                    {currentRound.items.map((emoji, idx) => {
                        const isSelected = selected === idx
                        const isCorrectChoice = idx === currentRound.correctIndex
                        let borderColor = 'border-white/20'
                        let bg = 'bg-white/10'
                        if (gameState === 'answered') {
                            if (isCorrectChoice) { borderColor = 'border-green-400'; bg = 'bg-green-400/20' }
                            else if (isSelected && !isCorrectChoice) { borderColor = 'border-red-400'; bg = 'bg-red-400/20' }
                        }
                        return (
                            <motion.button
                                key={idx}
                                className={`rounded-3xl border-4 ${borderColor} ${bg} flex items-center justify-center`}
                                style={{ minHeight: age === 3 ? 100 : 90, fontSize: age === 3 ? '3.5rem' : '3rem' }}
                                whileTap={{ scale: gameState === 'playing' ? 0.9 : 1 }}
                                animate={gameState === 'answered' && isCorrectChoice ? { scale: [1, 1.15, 1], transition: { duration: 0.4 } } : {}}
                                onClick={() => handleAnswer(idx)}
                                disabled={gameState === 'answered'}
                            >
                                {emoji}
                            </motion.button>
                        )
                    })}
                </motion.div>

                <div className="h-24 flex flex-col items-center justify-center gap-3">
                    <AnimatePresence>
                        {gameState === 'answered' && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3">
                                <p className="text-2xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                                    {isCorrect ? s.wellDone : s.tryAgain}
                                </p>
                                <Button onClick={nextRound}>{roundIndex + 1 >= TOTAL_ROUNDS ? s.finishGame : s.nextRound}</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </GameShell>
    )
}
