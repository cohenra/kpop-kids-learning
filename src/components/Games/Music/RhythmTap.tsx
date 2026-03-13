import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { t } from '../../../i18n/strings';
import { GameShell } from '../GameShell';
import { useProgress } from '../../../hooks/useProgress';
import { Button } from '../../UI/Button';

// ─── Piano Tiles-style Rhythm Tap game ────────────────────────────────────────

interface RhythmTapProps {
  onComplete: (sparks: number) => void;
  onBack: () => void;
}

// Web Audio helpers
function createAudioCtx(): AudioContext {
  return new window.AudioContext();
}

function playTapSound(ctx: AudioContext, lane: number) {
  const freqs = [523, 659, 784]; // C5, E5, G5 — musical chord
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqs[lane], ctx.currentTime);
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playMissSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

// ─── Game constants ────────────────────────────────────────────────────────────
const LANE_COLORS = ['#EC4899', '#7C3AED', '#06B6D4'] as const;
const LANE_EMOJIS = ['🎵', '🎶', '🎸'];
const FALL_DURATION_MS = 2400;
const HIT_ZONE_PCT = 78;
const HIT_TOLERANCE = 14;
const TOTAL_NOTES = 18;
const SPAWN_INTERVAL_MS = 850;

interface Note {
  id: number;
  lane: 0 | 1 | 2;
  spawnTime: number;
  hit: boolean;
  missed: boolean;
}

function getNoteY(note: Note, now = Date.now()): number {
  return Math.min(108, ((now - note.spawnTime) / FALL_DURATION_MS) * 100);
}

// ─── Main component ────────────────────────────────────────────────────────────

export function RhythmTap({ onComplete: _onComplete, onBack }: RhythmTapProps) {
  const { age, language, addSparks } = useApp();
  const { completeGame } = useProgress();
  const s = t(language);

  const SPARKS_PER_HIT = age === 3 ? 4 : 6;

  const [phase, setPhase] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<{ lane: number; id: number } | null>(null);
  const [, setRenderTick] = useState(0);

  const notesRef = useRef<Note[]>([]);
  const scoreRef = useRef(0);
  const spawnedRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animIdRef = useRef<number>(0);
  const gameOverRef = useRef(false);

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return;
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(id);
          setPhase('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ── Game loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    audioCtxRef.current = createAudioCtx();
    lastSpawnRef.current = Date.now();
    gameOverRef.current = false;

    function loop() {
      const now = Date.now();

      // Spawn new note
      if (spawnedRef.current < TOTAL_NOTES && now - lastSpawnRef.current >= SPAWN_INTERVAL_MS) {
        const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
        notesRef.current.push({ id: spawnedRef.current, lane, spawnTime: now, hit: false, missed: false });
        spawnedRef.current++;
        lastSpawnRef.current = now;
      }

      // Mark missed & remove off-screen
      notesRef.current = notesRef.current
        .map(n => ({
          ...n,
          missed: !n.hit && !n.missed && getNoteY(n, now) > HIT_ZONE_PCT + HIT_TOLERANCE + 5,
        }))
        .filter(n => getNoteY(n, now) <= 108);

      // Check game over
      if (spawnedRef.current >= TOTAL_NOTES && notesRef.current.length === 0 && !gameOverRef.current) {
        gameOverRef.current = true;
        const sparksEarned = scoreRef.current * SPARKS_PER_HIT;
        addSparks(sparksEarned);
        completeGame('music', 'rhythm-tap');
        setPhase('finished');
        return;
      }

      setRenderTick(t => t + 1);
      animIdRef.current = requestAnimationFrame(loop);
    }

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animIdRef.current);
      audioCtxRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Tap handler ────────────────────────────────────────────────────────────
  const handleLaneTap = useCallback((lane: 0 | 1 | 2) => {
    if (phase !== 'playing') return;
    const ctx = audioCtxRef.current;
    const now = Date.now();

    // Find first unhit note in this lane that's in the hit zone
    const idx = notesRef.current.findIndex(n =>
      n.lane === lane && !n.hit && !n.missed &&
      getNoteY(n, now) >= HIT_ZONE_PCT - HIT_TOLERANCE &&
      getNoteY(n, now) <= HIT_ZONE_PCT + HIT_TOLERANCE
    );

    if (idx !== -1) {
      notesRef.current[idx].hit = true;
      scoreRef.current++;
      setScore(s => s + 1);
      setHitFeedback({ lane, id: now });
      if (ctx) playTapSound(ctx, lane);
    } else {
      // Miss tap
      if (ctx) playMissSound(ctx);
    }
  }, [phase]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const displayNotes = notesRef.current;
  const sparksEarned = scoreRef.current * SPARKS_PER_HIT;

  if (phase === 'finished') {
    return (
      <GameShell title={s.games.rhythmTap} round={TOTAL_NOTES} totalRounds={TOTAL_NOTES} mood="excited" onBack={onBack}>
        <div className="flex-1 flex flex-col items-center justify-center text-white text-center gap-5 p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            className="text-7xl"
          >🎉</motion.div>
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
          >
            {s.goodJob}
          </h2>
          <p className="text-xl text-kpop-gold font-bold">
            {language === 'he'
              ? `ניצוצות: ${sparksEarned} ✨`
              : `Sparks: ${sparksEarned} ✨`}
          </p>
          <p className="text-white/60">
            {language === 'he' ? `פגעת ב-${scoreRef.current} תווים!` : `${scoreRef.current} notes hit!`}
          </p>
          <Button onClick={onBack} className="mt-2">{s.back}</Button>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      title={s.games.rhythmTap}
      round={Math.min(spawnedRef.current, TOTAL_NOTES)}
      totalRounds={TOTAL_NOTES}
      mood={phase === 'countdown' ? 'encouraging' : 'happy'}
      onBack={onBack}
    >
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Score */}
        <div className="flex items-center justify-between px-4 py-1">
          <span className="text-kpop-gold font-bold text-xl" style={{ fontFamily: 'Fredoka One' }}>
            ✨ {score}
          </span>
          <span className="text-white/50 text-sm" style={{ fontFamily: 'Nunito, Heebo' }}>
            {language === 'he' ? `${spawnedRef.current}/${TOTAL_NOTES} תווים` : `${spawnedRef.current}/${TOTAL_NOTES} notes`}
          </span>
        </div>

        {/* Game area */}
        <div
          className="relative flex flex-1 overflow-hidden rounded-2xl mx-2"
          style={{ background: 'linear-gradient(180deg, #0A0818 0%, #1E1B2E 100%)', minHeight: 260 }}
        >
          {/* Lane columns */}
          {[0, 1, 2].map((lane) => (
            <div
              key={lane}
              className="relative flex-1 overflow-hidden"
              style={{
                borderLeft: lane > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: `linear-gradient(180deg, transparent 0%, ${LANE_COLORS[lane]}08 100%)`,
              }}
            >
              {/* Lane top glow */}
              <div
                className="absolute top-0 inset-x-0 h-8"
                style={{ background: `linear-gradient(180deg, ${LANE_COLORS[lane]}20, transparent)` }}
              />

              {/* Hit zone bar */}
              <div
                className="absolute inset-x-1 h-4 rounded-full"
                style={{
                  top: `${HIT_ZONE_PCT}%`,
                  background: LANE_COLORS[lane],
                  opacity: 0.35,
                  boxShadow: `0 0 12px ${LANE_COLORS[lane]}`,
                }}
              />

              {/* Hit zone pulse */}
              <motion.div
                className="absolute inset-x-1 h-4 rounded-full pointer-events-none"
                style={{ top: `${HIT_ZONE_PCT}%`, background: LANE_COLORS[lane] }}
                animate={{ opacity: [0.1, 0.35, 0.1], scaleY: [1, 1.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />

              {/* Falling notes */}
              {displayNotes
                .filter(n => n.lane === lane && !n.hit)
                .map(note => {
                  const y = getNoteY(note);
                  return (
                    <div
                      key={note.id}
                      className="absolute rounded-full border-2 border-white/40"
                      style={{
                        width: 52,
                        height: 52,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: `calc(${y}% - 26px)`,
                        background: `radial-gradient(circle at 35% 35%, ${LANE_COLORS[lane]}ee, ${LANE_COLORS[lane]})`,
                        boxShadow: `0 0 18px ${LANE_COLORS[lane]}, 0 0 6px white inset`,
                        opacity: note.missed ? 0.2 : 1,
                        fontSize: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {LANE_EMOJIS[lane]}
                    </div>
                  );
                })
              }

              {/* Hit burst effect */}
              <AnimatePresence>
                {hitFeedback?.lane === lane && (
                  <motion.div
                    key={`hit-${hitFeedback.id}`}
                    className="absolute inset-x-0 rounded-full pointer-events-none"
                    style={{
                      top: `${HIT_ZONE_PCT}%`,
                      height: 52,
                      background: LANE_COLORS[lane],
                      marginTop: -26,
                    }}
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    onAnimationComplete={() => setHitFeedback(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Countdown overlay */}
          <AnimatePresence>
            {phase === 'countdown' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center z-30"
                style={{ background: 'rgba(10,8,24,0.85)', backdropFilter: 'blur(4px)' }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  className="text-white/70 text-lg mb-4"
                  style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                >
                  {language === 'he' ? 'הקישי על הנגן הנכון!' : 'Tap the right lane!'}
                </p>
                <motion.div
                  key={countdown}
                  className="text-8xl font-bold text-kpop-gold"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {countdown > 0 ? countdown : '🎵'}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tap buttons at bottom */}
        <div className="flex gap-2 p-3 pb-2">
          {([0, 1, 2] as const).map(lane => (
            <motion.button
              key={lane}
              className="flex-1 rounded-2xl font-bold text-white text-2xl select-none touch-manipulation"
              style={{
                background: `linear-gradient(135deg, ${LANE_COLORS[lane]}cc, ${LANE_COLORS[lane]})`,
                boxShadow: `0 0 18px ${LANE_COLORS[lane]}55`,
                minHeight: 68,
                fontFamily: 'Fredoka One, Nunito, sans-serif',
              }}
              whileTap={{ scale: 0.88, boxShadow: `0 0 32px ${LANE_COLORS[lane]}` }}
              onPointerDown={() => handleLaneTap(lane)}
            >
              {LANE_EMOJIS[lane]}
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
