import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { t } from '../../../i18n/strings'
import { GameShell } from '../GameShell'
import { useProgress } from '../../../hooks/useProgress'
import { Button } from '../../UI/Button'
import { MEMORY_CARD_PAIRS_AGE_3, MEMORY_CARD_PAIRS_AGE_5, shuffle } from '../../../data/logic'

interface MemoryCardsProps {
    onComplete: (sparks: number) => void
    onBack: () => void
}

interface Card {
    id: number
    pairId: number
    emoji: string
    flipped: boolean
    matched: boolean
}

const SPARKS = 50

export function MemoryCards({ onComplete, onBack }: MemoryCardsProps) {
    const { age, language, addSparks } = useApp()
    const { completeGame } = useProgress()
    const s = t(language)

    const pairs = age === 3 ? MEMORY_CARD_PAIRS_AGE_3 : MEMORY_CARD_PAIRS_AGE_5

    const buildDeck = useCallback((): Card[] => {
        const doubled = [...pairs, ...pairs]
        const shuffled = shuffle(doubled)
        return shuffled.map((emoji, idx) => ({
            id: idx,
            pairId: pairs.indexOf(emoji),
            emoji,
            flipped: false,
            matched: false,
        }))
    }, [pairs])

    const [cards, setCards] = useState<Card[]>(() => buildDeck())
    const [flippedIds, setFlippedIds] = useState<number[]>([])
    const [moves, setMoves] = useState(0)
    const [locked, setLocked] = useState(false)
    const [finished, setFinished] = useState(false)

    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.matched)) {
            const timeout = setTimeout(() => {
                addSparks(SPARKS)
                completeGame('logic', 'memory-cards')
                setFinished(true)
                onComplete(SPARKS)
            }, 600)
            return () => clearTimeout(timeout)
        }
    }, [cards, addSparks, completeGame, onComplete])

    const handleFlip = (cardId: number) => {
        if (locked) return
        const card = cards.find(c => c.id === cardId)
        if (!card || card.flipped || card.matched) return
        if (flippedIds.includes(cardId)) return

        const newFlipped = [...flippedIds, cardId]
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, flipped: true } : c))
        setFlippedIds(newFlipped)

        if (newFlipped.length === 2) {
            setMoves(m => m + 1)
            setLocked(true)

            const [id1] = newFlipped
            const c1 = cards.find(c => c.id === id1)!
            const c2pairId = cards.find(c => c.id === cardId)!.pairId
            const isMatch = c1.pairId === c2pairId

            setTimeout(() => {
                if (isMatch) {
                    setCards(prev =>
                        prev.map(c => (c.id === id1 || c.id === cardId) ? { ...c, flipped: true, matched: true } : c)
                    )
                } else {
                    setCards(prev =>
                        prev.map(c => (c.id === id1 || c.id === cardId) ? { ...c, flipped: false } : c)
                    )
                }
                setFlippedIds([])
                setLocked(false)
            }, 1200)
        }
    }

    const cols = 4
    const cardSize = age === 3 ? 72 : 60

    if (finished) {
        return (
            <GameShell
                title={language === 'he' ? 'קלפי זיכרון' : 'Memory Cards'}
                round={pairs.length} totalRounds={pairs.length} mood="excited" onBack={onBack}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🃏</motion.div>
                    <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
                    <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(SPARKS))}</p>
                    <p className="text-white/60 text-base">
                        {language === 'he' ? `סיימת ב-${moves} מהלכים!` : `You did it in ${moves} moves!`}
                    </p>
                    <Button onClick={onBack} className="mt-4">{s.back}</Button>
                </div>
            </GameShell>
        )
    }

    const matchedPairs = Math.floor(cards.filter(c => c.matched).length / 2)

    return (
        <GameShell
            title={language === 'he' ? 'קלפי זיכרון' : 'Memory Cards'}
            round={matchedPairs} totalRounds={pairs.length}
            mood={locked ? 'thinking' : 'happy'}
            onBack={onBack}
        >
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-2">
                <p className="text-white/50 text-sm">
                    {language === 'he' ? `מהלכים: ${moves}` : `Moves: ${moves}`}
                </p>

                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {cards.map((card) => (
                        <motion.button
                            key={card.id}
                            className="rounded-2xl select-none touch-manipulation"
                            style={{ width: cardSize, height: cardSize }}
                            whileTap={{ scale: card.flipped || card.matched ? 1 : 0.9 }}
                            onClick={() => handleFlip(card.id)}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {card.flipped || card.matched ? (
                                    <motion.div
                                        key="front"
                                        initial={{ rotateY: 90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        exit={{ rotateY: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full rounded-2xl flex items-center justify-center"
                                        style={{
                                            fontSize: age === 3 ? '2rem' : '1.75rem',
                                            background: card.matched
                                                ? 'linear-gradient(135deg, rgba(74,222,128,0.3), rgba(45,42,74,0.9))'
                                                : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(45,42,74,0.9))',
                                            boxShadow: card.matched ? '0 0 16px rgba(74,222,128,0.5)' : 'none',
                                            border: card.matched ? '2px solid rgba(74,222,128,0.6)' : '2px solid rgba(255,255,255,0.15)',
                                        }}
                                    >
                                        {card.emoji}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="back"
                                        initial={{ rotateY: 90, opacity: 0 }}
                                        animate={{ rotateY: 0, opacity: 1 }}
                                        exit={{ rotateY: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="w-full h-full rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #3B1D6E, #1E1B2E)',
                                            border: '2px solid rgba(124,58,237,0.4)',
                                            fontSize: '1.5rem',
                                        }}
                                    >
                                        ⭐
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>

                <p className="text-white/40 text-xs">
                    {matchedPairs} / {pairs.length} {language === 'he' ? 'זוגות' : 'pairs'}
                </p>
            </div>
        </GameShell>
    )
}
