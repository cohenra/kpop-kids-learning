import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { t } from '../../../i18n/strings';
import { GameShell } from '../GameShell';
import { useProgress } from '../../../hooks/useProgress';
import { Button } from '../../UI/Button';

interface RhythmTapProps {
  onComplete: (sparks: number) => void;
  onBack: () => void;
}

export function RhythmTap({ onComplete, onBack }: RhythmTapProps) {
  const { age, language, addSparks } = useApp();
  const { completeGame } = useProgress();
  const s = t(language);

  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finishedRound'>('idle');

  const settings = age === 3
    ? { tempo: 60, beats: 4, window: 500, sparks: 10 }
    : { tempo: 90, beats: 8, window: 300, sparks: 15 };

  const handleRoundComplete = (roundScore: number) => {
    setTotalScore(prev => prev + roundScore);
    setGameState('finishedRound');
  };

  const nextRound = () => {
    if (round < 2) {
      setRound(prev => prev + 1);
      setGameState('idle');
    } else {
      const sparksEarned = totalScore * settings.sparks;
      addSparks(sparksEarned);
      completeGame('music', 'rhythm-tap');
      onComplete(sparksEarned);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <GameShell title={s.games.rhythmTap} round={3} totalRounds={3} mood="excited" onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl">🥁</motion.div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.goodJob}</h2>
          <p className="text-xl text-kpop-gold">{s.sparksEarned.replace('{count}', String(totalScore * settings.sparks))}</p>
          <Button onClick={onBack} className="mt-4">{s.back}</Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title={s.games.rhythmTap} round={round} totalRounds={3} mood={gameState === 'finishedRound' ? 'happy' : 'encouraging'} onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {gameState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-white flex flex-col items-center gap-6">
              <div className="text-6xl">🥁</div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                {language === 'he' ? `סיבוב ${round + 1} / 3` : `Round ${round + 1} / 3`}
              </h2>
              <p className="text-white/70" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
                {language === 'he'
                  ? 'הקישי על הכפתור בכל פעם שמגיע הניצוץ!'
                  : 'Tap the button each time the flash appears!'}
              </p>
              <Button onClick={() => setGameState('playing')}>{s.start}</Button>
            </motion.div>
          )}
          {gameState === 'playing' && (
            <RhythmCircle key={`game-${round}`} settings={settings} language={language} onRoundComplete={handleRoundComplete} />
          )}
          {gameState === 'finishedRound' && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-white flex flex-col items-center gap-6">
              <div className="text-5xl">⭐</div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>{s.roundOver}</h2>
              <p className="text-white/70">
                {language === 'he' ? `ניקוד: ${totalScore}` : `Score: ${totalScore}`}
              </p>
              <Button onClick={nextRound}>{round < 2 ? s.nextRound : s.finishGame}</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  );
}

// ─── Helper: create/resume AudioContext ─────────────────────────────────────

function getAudioContext(): AudioContext {
  // Create a new AudioContext on every call to avoid stale suspended contexts
  return new window.AudioContext();
}

function playBeep(ctx: AudioContext, time: number, freq = 440) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.15);
}

interface RhythmCircleProps {
  settings: { tempo: number; beats: number; window: number };
  language: string;
  onRoundComplete: (score: number) => void;
}

function RhythmCircle({ settings, language, onRoundComplete }: RhythmCircleProps) {
  const { tempo, beats, window: timeWindow } = settings;
  const interval = 60 / tempo;

  const [taps, setTaps] = useState(0);
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);
  const [beatIndex, setBeatIndex] = useState(-1);

  const beatTimesRef = useRef<number[]>([]);
  const beatsHitRef = useRef<boolean[]>(new Array(beats).fill(false));
  const roundScoreRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  // Countdown then start
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Start audio sequence once countdown ends
  useEffect(() => {
    if (!started) return;

    const ctx = getAudioContext();
    ctxRef.current = ctx;

    const startTime = ctx.currentTime + 0.1;
    beatTimesRef.current = Array.from({ length: beats }, (_, i) => startTime + i * interval);

    // Schedule all beeps
    beatTimesRef.current.forEach((time, i) => {
      playBeep(ctx, time, i === 0 ? 660 : 440); // First beat higher pitch

      const delay = (time - ctx.currentTime) * 1000;
      setTimeout(() => {
        setFlash(true);
        setBeatIndex(i);
        setTimeout(() => setFlash(false), 150);
      }, Math.max(0, delay));
    });

    // End of round
    const endDelay = (beatTimesRef.current[beats - 1] - ctx.currentTime + 1.2) * 1000;
    const endTimer = setTimeout(() => {
      onRoundComplete(roundScoreRef.current);
      ctx.close();
    }, endDelay);

    return () => {
      clearTimeout(endTimer);
      ctx.close().catch(() => { });
    };
  }, [started, beats, interval, onRoundComplete]);

  const handleTap = () => {
    if (!started || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    setTaps(t => t + 1);

    // Play tap sound
    playBeep(ctx, now, 880);

    // Check if tap is near a beat
    for (let i = 0; i < beatTimesRef.current.length; i++) {
      if (!beatsHitRef.current[i] && Math.abs(now - beatTimesRef.current[i]) < timeWindow / 1000) {
        beatsHitRef.current[i] = true;
        roundScoreRef.current++;
        break;
      }
    }
  };

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 text-white text-center"
      >
        <motion.div
          className="text-8xl font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {countdown}
        </motion.div>
        <p className="text-white/60">
          {language === 'he' ? 'מתחילים...' : 'Get ready...'}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Beat indicators */}
      <div className="flex gap-2 flex-wrap justify-center max-w-xs">
        {Array.from({ length: beats }).map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full"
            animate={{
              scale: i === beatIndex ? 1.8 : 1,
              background: beatsHitRef.current[i]
                ? '#10B981'
                : i === beatIndex
                  ? '#F59E0B'
                  : 'rgba(255,255,255,0.2)',
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* The big tap button */}
      <motion.button
        className="rounded-full flex items-center justify-center select-none touch-manipulation cursor-pointer"
        style={{
          width: 200,
          height: 200,
          background: flash
            ? 'radial-gradient(circle, #F59E0B, #EC4899)'
            : 'radial-gradient(circle, #7C3AED, #3B1D6E)',
          boxShadow: flash
            ? '0 0 60px #F59E0B, 0 0 120px rgba(245,158,11,0.4)'
            : '0 0 30px #7C3AED',
        }}
        animate={{ scale: flash ? 1.12 : 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 15 }}
        onPointerDown={handleTap}
      >
        <span className="text-6xl select-none">🥁</span>
      </motion.button>

      <p className="text-white/60 text-lg" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
        {language === 'he' ? `הקשות: ${taps}` : `Taps: ${taps}`}
      </p>
      <p className="text-white/40 text-sm" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
        {language === 'he' ? 'הקישי כשהכפתור מאיר!' : 'Tap when the button flashes!'}
      </p>
    </div>
  );
}