import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { t } from '../../../i18n/strings';
import { GameShell } from '../GameShell';
import { useProgress } from '../../../hooks/useProgress';
import type { Instrument } from '../../../data/music';
import { INSTRUMENTS, shuffle, pickRandom } from '../../../data/music';
import { Button } from '../../UI/Button';

interface InstrumentRecognitionProps {
  onComplete: (sparks: number) => void;
  onBack: () => void;
}

// Web Audio API setup
let audioContext: AudioContext;
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  return audioContext;
};

function playInstrumentSound(instrument: Instrument | null) {
  if (!instrument) return;
  const context = getAudioContext();
  const now = context.currentTime;

  switch (instrument.id) {
    case 'drum': {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case 'piano': {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
    case 'guitar': {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(196, now); // G3
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.7);
      break;
    }
    case 'trumpet': {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }
  }
}


export function InstrumentRecognition({ onComplete, onBack }: InstrumentRecognitionProps) {
  const { age, language, addSparks } = useApp();
  const { completeGame } = useProgress();
  const s = t(language);

  const [gameState, setGameState] = useState<'playing' | 'answered' | 'finished'>('playing');
  const [rounds, setRounds] = useState(0);
  const [score, setScore] = useState(0);
  const [currentInstrument, setCurrentInstrument] = useState<Instrument | null>(null);
  const [choices, setChoices] = useState<Instrument[]>([]);
  const [wasCorrect, setWasCorrect] = useState(false);


  const settings = age === 3
    ? { numChoices: 2, numRounds: 8, sparks: 10 }
    : { numChoices: 4, numRounds: 10, sparks: 12 };

  const nextRound = useCallback(() => {
    if (rounds >= settings.numRounds - 1) {
      const sparksEarned = score * settings.sparks;
      addSparks(sparksEarned);
      completeGame('music', 'instrument-recognition');
      onComplete(sparksEarned);
      setGameState('finished');
      return;
    }

    const instrument = shuffle(INSTRUMENTS)[0];
    setCurrentInstrument(instrument);

    const otherChoices = INSTRUMENTS.filter(i => i.id !== instrument.id);
    const randomChoices = pickRandom(otherChoices, settings.numChoices - 1);
    setChoices(shuffle([instrument, ...randomChoices]));
    setRounds(prev => prev + 1);
    setGameState('playing');
    playInstrumentSound(instrument)
  }, [rounds, score, settings, addSparks, onComplete]);

  useEffect(() => {
    nextRound();
  }, []);

  const handleAnswer = (instrument: Instrument) => {
    const correct = instrument.id === currentInstrument?.id
    if (correct) {
      setScore(prev => prev + 1);
    }
    setWasCorrect(correct)
    setGameState('answered');
  };

  if (gameState === 'finished') {
    return (
      <GameShell title={s.games.instrumentRecognition} round={settings.numRounds} totalRounds={settings.numRounds} mood="excited" onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{s.goodJob}</h2>
          <p className="text-xl">{s.sparksEarned.replace('{count}', String(score * settings.sparks))}</p>
          <Button onClick={onBack} className="mt-8">{s.back}</Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title={s.games.instrumentRecognition} round={rounds} totalRounds={settings.numRounds} mood={gameState === 'answered' ? (wasCorrect ? 'excited' : 'encouraging') : 'thinking'} onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-around p-4">
        <div className="text-center text-white">
          <p>{s.round} {rounds + 1} / {settings.numRounds}</p>
          <p>{s.score}: {score}</p>
          <h2 className='text-2xl mt-4'>{s.games.instrumentRecognitionIntro}</h2>
        </div>

        <Button onClick={() => playInstrumentSound(currentInstrument)} size="lg">
          {s.games.playAgain}
        </Button>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {choices.map(instrument => (
            <Button
              key={instrument.id}
              onClick={() => handleAnswer(instrument)}
              disabled={gameState === 'answered'}
              variant={gameState === 'answered' && instrument.id === currentInstrument?.id ? 'gold' : 'primary'}
            >
              <span className="text-4xl">{instrument.emoji}</span>
              <span>{language === 'he' ? instrument.nameHe : instrument.nameEn}</span>
            </Button>
          ))}
        </div>

        {gameState === 'answered' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center text-white p-4 rounded-2xl bg-black/30">
            <h3 className='text-2xl mb-4'>{wasCorrect ? s.wellDone : s.tryAgain}</h3>
            <Button onClick={nextRound}>{s.nextRound}</Button>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
}