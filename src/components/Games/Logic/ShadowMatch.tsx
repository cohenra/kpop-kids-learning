import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { t } from '../../../i18n/strings'
import { GameShell } from '../GameShell'
import { useProgress } from '../../../hooks/useProgress'
import { Button } from '../../UI/Button'
import { speak } from '../../../utils/tts'
import {
    SHADOW_MATCH_ROUNDS_AGE_3,
    SHADOW_MATCH_ROUNDS_AGE_5,
    shuffle,
} from '../../../data/logic'

interface ShadowMatchProps {
    onComplete: (sparks: number) => void
    onBack: () => void
}

const SPARKS_PER_CORRECT = 10
const TOTAL_ROUNDS = 10

export function ShadowMatch({ onComplete, onBack }: ShadowMatchProps) {
    const { age, language, addSparks } = useApp()
    const { completeGame } = useProgress()
    const s = t(language)

    const [rounds] = useState(() =>
        age === 3
            ? shuffle([...SHADOW_MATCH_ROUNDS_AGE_3])
            : shuffle([...SHADOW_MATCH_ROUNDS_AGE_5])
    )

    const [roundIndex, setRoundIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [selected, setSelected] = useState<number | null>(null)
    const [gameState, setGameState] = useState<'playing' | 'answered' | 'finished'>('playing')

    const currentRound = rounds[roundIndex % rounds.length]

    const speakInstruction = useCallback(() => {
        const instruction = language === 'he'
            ? `מצאי את הצל של ה${currentRound.labelHe}`
            : `Find the shadow of the ${currentRound.labelEn}`
        speak(instruction, language)
    }, [currentRound, language])

    useEffect(() => {
        const timer = setTimeout(speakInstruction, 600)
        return () => clearTimeout(timer)
    }, [roundIndex, speakInstruction])

    const handleAnswer = (idx: number) => {
        if (gameState === 'answered') return
        setSelected(idx)
        const correct = idx === currentRound.correctIndex
        if (correct) setScore(prev => prev + 1)
        setGameState('answered')
    }

    const nextRound = () => {
        if (roundIndex + 1 >= TOTAL_ROUNDS) {
            const sparksEarned = score * SPARKS_PER_CORRECT
            addSparks(sparksEarned)
            completeGame('logic', 'shadow-match')
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
                title={language === 'he' ? 'התאמת צללים' : 'Shadow Match'}
                round={TOTAL_ROUNDS} totalRounds={TOTAL_ROUNDS} mood="excited" onBack={onBack}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🖼️</motion.div>
                    <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
                    <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(score * SPARKS_PER_CORRECT))}</p>
                    <p className="text-white/50 text-sm">{score} / {TOTAL_ROUNDS} {language === 'he' ? 'נכון' : 'correct'}</p>
                    <Button onClick={onBack} className="mt-4">{s.back}</Button>
                </div>
            </GameShell>
        )
    }

    const numChoices = currentRound.choices.length

    return (
        <GameShell
            title={language === 'he' ? 'התאמת צללים' : 'Shadow Match'}
            round={roundIndex} totalRounds={TOTAL_ROUNDS}
            mood={gameState === 'answered' ? (selected === currentRound.correctIndex ? 'excited' : 'encouraging') : 'thinking'}
            onBack={onBack}
        >
            <div className="flex-1 flex flex-col items-center justify-between p-4 text-white">
                <div className="w-full flex justify-between">
                    <p className="text-white/50 text-sm">{s.round} {roundIndex + 1} / {TOTAL_ROUNDS}</p>
                    <p className="text-kpop-gold font-bold">{s.score}: {score}</p>
                </div>

                <motion.div
                    key={`target-${roundIndex}`}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-2"
                >
                    <motion.button className="text-8xl select-none touch-manipulation" whileTap={{ scale: 0.95 }} onClick={speakInstruction}>
                        {currentRound.target}
                    </motion.button>
                    <p className="text-white/60 text-sm" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                        🔊 {language === 'he'
                            ? `מצאי את הצל של ה${currentRound.labelHe}`
                            : `Find the shadow of the ${currentRound.labelEn}`}
                    </p>
                </motion.div>

                <motion.div
                    key={`choices-${roundIndex}`}
                    className="flex gap-4 justify-center flex-wrap"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                >
                    {currentRound.choices.map((emoji, idx) => {
                        const isSelected = selected === idx
                        const isCorrectChoice = idx === currentRound.correctIndex
                        let ringColor = 'border-white/10'
                        let glowShadow = 'none'
                        if (gameState === 'answered') {
                            if (isCorrectChoice) { ringColor = 'border-green-400'; glowShadow = '0 0 20px rgba(74,222,128,0.5)' }
                            else if (isSelected) { ringColor = 'border-red-400'; glowShadow = '0 0 20px rgba(248,113,113,0.4)' }
                        }
                        const emojiSize = numChoices <= 2 ? '4.5rem' : '3rem'
                        const boxSize = numChoices <= 2 ? (age === 3 ? 110 : 100) : (age === 3 ? 88 : 80)
                        return (
                            <motion.button
                                key={idx}
                                className={`rounded-3xl border-4 ${ringColor} flex items-center justify-center`}
                                style={{
                                    width: boxSize, height: boxSize, fontSize: emojiSize, boxShadow: glowShadow,
                                    filter: gameState === 'playing' || (gameState === 'answered' && !isCorrectChoice && !isSelected)
                                        ? 'grayscale(1) brightness(0.15)' : 'none',
                                }}
                                whileTap={{ scale: gameState === 'playing' ? 0.88 : 1 }}
                                animate={gameState === 'answered' && isCorrectChoice ? { scale: [1, 1.15, 1] } : {}}
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
                                    {selected === currentRound.correctIndex ? s.wellDone : s.tryAgain}
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
