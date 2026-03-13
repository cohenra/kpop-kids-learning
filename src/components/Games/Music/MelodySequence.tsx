import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../../context/AppContext'
import { t } from '../../../i18n/strings'
import { GameShell } from '../GameShell'
import { useProgress } from '../../../hooks/useProgress'
import type { MelodyNote } from '../../../data/music'
import { MELODY_NOTES, shuffle } from '../../../data/music'
import { Button } from '../../UI/Button'

// --- Web Audio API ---
let audioCtx: AudioContext | null = null;
const getAC = () => {
  if (!audioCtx) audioCtx = new window.AudioContext();
  return audioCtx;
};

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
};

function playNote(note: string, when: number) {
  const ctx = getAC();
  const t0 = when < ctx.currentTime ? ctx.currentTime : when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(NOTE_FREQ[note] ?? 440, t0);
  gain.gain.setValueAtTime(0.7, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.4);
}

interface MelodySequenceProps {
  onComplete: (sparks: number) => void;
  onBack: () => void;
}

type GameState = 'watching' | 'playing' | 'answered' | 'finished';

export function MelodySequence({ onComplete, onBack }: MelodySequenceProps) {
  const { age, language, addSparks } = useApp();
  const { completeGame } = useProgress();
  const s = t(language);

  const settings = age === 3
    ? { minSeq: 2, maxSeq: 3, numColors: 3, sparksPerCorrect: 15, rounds: 5 }
    : { minSeq: 2, maxSeq: 4, numColors: 5, sparksPerCorrect: 20, rounds: 8 };

  const availableNotes = MELODY_NOTES.slice(0, settings.numColors);

  const [gameState, setGameState] = useState<GameState>('watching');
  const [sequence, setSequence] = useState<MelodyNote[]>([]);
  const [playerSequence, setPlayerSequence] = useState<MelodyNote[]>([]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const playingRef = useRef(false);

  const playSequence = useCallback((seq: MelodyNote[]) => {
    if (playingRef.current) return;
    playingRef.current = true;
    setActiveNote(null);
    setGameState('watching');

    const ctx = getAC();
    let t0 = ctx.currentTime + 0.4;
    seq.forEach((note) => {
      const noteStart = t0;
      playNote(note.note, noteStart);
      const highlightDelay = (noteStart - ctx.currentTime) * 1000;
      setTimeout(() => setActiveNote(note.note), highlightDelay);
      setTimeout(() => setActiveNote(null), highlightDelay + 350);
      t0 += 0.6;
    });
    const doneDelay = (t0 - ctx.currentTime + 0.1) * 1000;
    setTimeout(() => {
      setActiveNote(null);
      setGameState('playing');
      playingRef.current = false;
    }, doneDelay);
  }, []);

  const startRound = useCallback((roundNum: number) => {
    const len = Math.min(settings.minSeq + Math.floor(roundNum / 2), settings.maxSeq);
    const seq = Array.from({ length: len }, () => shuffle(availableNotes)[0]);
    setSequence(seq);
    setPlayerSequence([]);
    setLastCorrect(null);
    setTimeout(() => playSequence(seq), 400);
  }, [settings, availableNotes, playSequence]);

  useEffect(() => {
    startRound(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayerTap = (note: MelodyNote) => {
    if (gameState !== 'playing') return;
    playNote(note.note, getAC().currentTime);
    const newSeq = [...playerSequence, note];
    setPlayerSequence(newSeq);

    if (newSeq.length === sequence.length) {
      const correct = newSeq.every((n, i) => n.note === sequence[i].note);
      setLastCorrect(correct);
      if (correct) setScore(prev => prev + 1);
      setGameState('answered');
    }
  };

  const nextRound = () => {
    const nextRoundNum = round + 1;
    if (nextRoundNum >= settings.rounds) {
      const sparksEarned = score * settings.sparksPerCorrect;
      addSparks(sparksEarned);
      completeGame('music', 'melody-sequence');
      onComplete(sparksEarned);
      setGameState('finished');
    } else {
      setRound(nextRoundNum);
      startRound(nextRoundNum);
    }
  };

  if (gameState === 'finished') {
    return (
      <GameShell title={s.games.melodySequence} round={settings.rounds} totalRounds={settings.rounds} mood="excited" onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🎶</motion.div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
          <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(score * settings.sparksPerCorrect))}</p>
          <Button onClick={onBack} className="mt-4">{s.back}</Button>
        </div>
      </GameShell>
    );
  }

  const stateTitle = gameState === 'watching' ? s.games.melodySequenceWatch
    : gameState === 'playing' ? s.games.melodySequenceRepeat
      : lastCorrect ? s.wellDone : s.tryAgain;

  return (
    <GameShell
      title={s.games.melodySequence}
      round={round}
      totalRounds={settings.rounds}
      mood={gameState === 'answered' ? (lastCorrect ? 'excited' : 'encouraging') : 'happy'}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col items-center justify-around p-4 text-white text-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{stateTitle}</h2>
        </div>

        {/* Note buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          {availableNotes.map(note => (
            <motion.button
              key={note.note}
              className="rounded-full border-4 flex items-center justify-center"
              style={{
                width: age === 3 ? 80 : 72,
                height: age === 3 ? 80 : 72,
                backgroundColor: note.color,
                borderColor: activeNote === note.note ? '#ffffff' : note.color,
                boxShadow: activeNote === note.note ? `0 0 24px ${note.color}` : 'none',
              }}
              onPointerDown={() => handlePlayerTap(note)}
              whileTap={{ scale: gameState === 'playing' ? 0.88 : 1 }}
              animate={{ scale: activeNote === note.note ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            />
          ))}
        </div>

        {/* Player progress dots */}
        <div className="flex gap-2 h-6 items-center">
          {sequence.map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full"
              style={{ background: i < playerSequence.length ? playerSequence[i].color : 'rgba(255,255,255,0.2)' }}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <AnimatePresence mode="wait">
            {gameState === 'answered' && (
              <motion.div key="next" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Button onClick={nextRound}>{round + 1 >= settings.rounds ? s.finishGame : s.nextRound}</Button>
              </motion.div>
            )}
            {(gameState === 'watching' || gameState === 'playing') && (
              <motion.div key="replay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button variant="secondary" onClick={() => { if (playingRef.current) return; setPlayerSequence([]); playSequence(sequence); }} disabled={gameState === 'watching'}>
                  🔁 {s.games.playAgain}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameShell>
  );
}