import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../../context/AppContext';
import { t } from '../../../i18n/strings';
import { GameShell } from '../GameShell';
import { useProgress } from '../../../hooks/useProgress';
import { Button } from '../../UI/Button';
import { Character } from '../../Character/Character';
import { speak } from '../../../utils/tts';

interface FreePianoProps {
  onBack: () => void;
}

// --- Web Audio API ---
let audioCtx: AudioContext | null = null;
const getAC = () => {
  if (!audioCtx) audioCtx = new window.AudioContext();
  return audioCtx;
};

const NOTE_FREQ: Record<string, number> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
};

function playPianoNote(note: string) {
  const ctx = getAC();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(NOTE_FREQ[note] ?? 440, now);
  gain.gain.setValueAtTime(0.7, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.6);
}

const ALL_KEYS = [
  { note: 'C4', color: '#EC4899', label: 'C' },
  { note: 'D4', color: '#F59E0B', label: 'D' },
  { note: 'E4', color: '#10B981', label: 'E' },
  { note: 'F4', color: '#06B6D4', label: 'F' },
  { note: 'G4', color: '#8B5CF6', label: 'G' },
  { note: 'A4', color: '#7C3AED', label: 'A' },
  { note: 'B4', color: '#D946EF', label: 'B' },
  { note: 'C5', color: '#F43F5E', label: 'C' },
];
const AGE3_KEYS = ['C4', 'D4', 'E4', 'G4', 'A4'];
const SPARKS_THRESHOLD = 10;
const SPARKS_AWARD = 30;

export function FreePiano({ onBack }: FreePianoProps) {
  const { age, language, addSparks, activeProfile } = useApp();
  const { completeGame } = useProgress();
  const s = t(language);

  const keys = age === 3 ? ALL_KEYS.filter(k => AGE3_KEYS.includes(k.note)) : ALL_KEYS;
  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4';
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899';

  const notesCountRef = useRef(0);
  const awardedRef = useRef(false);
  const isRecordingRef = useRef(false);
  const recordedNotesRef = useRef<string[]>([]);

  const [notesPlayed, setNotesPlayed] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedCount, setRecordedCount] = useState(0);
  const [sparksAwarded, setSparksAwarded] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleNotePlay = useCallback((note: string) => {
    playPianoNote(note);
    setActiveKey(note);
    setTimeout(() => setActiveKey(null), 200);

    notesCountRef.current += 1;
    setNotesPlayed(notesCountRef.current);

    if (isRecordingRef.current && recordedNotesRef.current.length < 8) {
      recordedNotesRef.current = [...recordedNotesRef.current, note];
      setRecordedCount(recordedNotesRef.current.length);
    }

    if (notesCountRef.current >= SPARKS_THRESHOLD && !awardedRef.current) {
      awardedRef.current = true;
      addSparks(SPARKS_AWARD);
      completeGame('music', 'free-piano');
      setSparksAwarded(true);
      speak(s.games.beautifulMusic, language);
    }
  }, [addSparks, completeGame, language, s.games.beautifulMusic]);

  const toggleRecording = () => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      const notes = [...recordedNotesRef.current];
      const ctx = getAC();
      let t0 = ctx.currentTime + 0.1;
      notes.forEach(note => {
        const freq = NOTE_FREQ[note] ?? 440;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.7, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.5);
        t0 += 0.55;
      });
    } else {
      recordedNotesRef.current = [];
      setRecordedCount(0);
      isRecordingRef.current = true;
      setIsRecording(true);
    }
  };

  return (
    <GameShell
      title={s.games.freePiano}
      round={notesPlayed}
      totalRounds={SPARKS_THRESHOLD}
      mood={notesPlayed >= SPARKS_THRESHOLD ? 'excited' : notesPlayed > 3 ? 'happy' : 'idle'}
      onBack={onBack}
      hideCharacter
    >
      <div className="flex-1 flex flex-col items-center justify-between p-4 pb-2">
        {/* Character dances */}
        <div className="flex flex-col items-center">
          <Character
            mood={notesPlayed >= SPARKS_THRESHOLD ? 'excited' : notesPlayed > 3 ? 'happy' : 'idle'}
            size={80}
            hairColor={hairColor}
            outfitColor={outfitColor}
          />
          <p className="text-white/70 text-sm mt-1" style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
            {s.games.freePianoIntro}
          </p>
          {sparksAwarded && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-kpop-gold font-bold text-lg mt-1"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              ✨ {s.sparksEarned.replace('{count}', String(SPARKS_AWARD))}
            </motion.p>
          )}
        </div>

        {/* Piano keys */}
        <div className="flex items-end justify-center gap-1.5 py-2">
          {keys.map((key) => (
            <motion.button
              key={key.note}
              className="rounded-b-2xl border-b-4 flex flex-col justify-end items-center pb-2 select-none touch-manipulation"
              style={{
                backgroundColor: key.color,
                borderColor: `${key.color}99`,
                width: age === 3 ? 56 : 44,
                height: age === 3 ? 140 : 120,
                boxShadow: activeKey === key.note ? `0 0 20px ${key.color}` : 'none',
              }}
              onPointerDown={() => handleNotePlay(key.note)}
              animate={{ scaleY: activeKey === key.note ? 0.94 : 1 }}
              transition={{ type: 'spring', stiffness: 600 }}
            >
              <span className="font-bold text-black/60 text-sm select-none">{key.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Record button */}
        <Button onClick={toggleRecording} variant={isRecording ? 'gold' : 'secondary'} size="sm">
          {isRecording
            ? `🔴 ${s.games.stopRecording} (${recordedCount}/8)`
            : `⏺️ ${s.games.startRecording}`}
        </Button>
      </div>
    </GameShell>
  );
}
