import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useProgress } from '../../../hooks/useProgress';
import { Character } from '../../Character/Character';
import { StarParticles } from '../../UI/StarParticles';
import { SparkCounter } from '../../UI/SparkCounter';
import { t } from '../../../i18n/strings';
import { JigsawPuzzle } from './JigsawPuzzle';
import { OddOneOut } from './OddOneOut';
import { ShadowMatch } from './ShadowMatch';
import { MemoryCards } from './MemoryCards';

type GameId = 'jigsaw-puzzle' | 'odd-one-out' | 'shadow-match' | 'memory-cards';
type HubState = 'menu' | GameId | 'all-complete';

interface GameCard {
  id: GameId;
  emoji: string;
  titleHe: string;
  titleEn: string;
  descHe: string;
  descEn: string;
  color: string;
  glowColor: string;
}

const GAME_CARDS: GameCard[] = [
  {
    id: 'jigsaw-puzzle',
    emoji: '🧩',
    titleHe: 'פאזל',
    titleEn: 'Jigsaw Puzzle',
    descHe: 'הרכיבי את התמונה',
    descEn: 'Assemble the picture',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
  },
  {
    id: 'odd-one-out',
    emoji: '🤔',
    titleHe: 'מה לא שייך?',
    titleEn: 'Odd One Out',
    descHe: 'מצאי את הפריט השונה',
    descEn: 'Find the different item',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
  {
    id: 'shadow-match',
    emoji: '🖼️',
    titleHe: 'התאמת צללים',
    titleEn: 'Shadow Match',
    descHe: 'התאימי את הצללית הנכונה',
    descEn: 'Match the correct shadow',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'memory-cards',
    emoji: '🃏',
    titleHe: 'קלפי זיכרון',
    titleEn: 'Memory Cards',
    descHe: 'מצאי את הזוגות',
    descEn: 'Find the matching pairs',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
];

export function LogicRoom() {
  const navigate = useNavigate();
  const { language, isRTL, activeProfile, addSparks } = useApp();
  const { isGameCompleted } = useProgress();
  const s = t(language);

  const [hubState, setHubState] = useState<HubState>('menu');
  const [lastEarned, setLastEarned] = useState(0);

  const hairColor = activeProfile?.id === 1 ? '#EC4899' : '#06B6D4';
  const outfitColor = activeProfile?.id === 1 ? '#7C3AED' : '#EC4899';

  const allComplete = GAME_CARDS.every((g) =>
    isGameCompleted('logic', g.id)
  );

  const handleGameComplete = (gameId: GameId, sparksEarned: number) => {
    setLastEarned(sparksEarned);
    addSparks(sparksEarned);

    const completedNow = GAME_CARDS.filter((g) =>
      g.id === gameId || isGameCompleted('logic', g.id)
    );
    if (completedNow.length >= GAME_CARDS.length) {
      setHubState('all-complete');
    } else {
      setHubState('menu');
    }
  };

  // ── Active game rendering ──────────────────────────────────────────────────
  if (hubState === 'jigsaw-puzzle') {
    return (
      <JigsawPuzzle
        onComplete={(sparks) => handleGameComplete('jigsaw-puzzle', sparks)}
        onBack={() => setHubState('menu')}
      />
    );
  }
  if (hubState === 'odd-one-out') {
    return (
      <OddOneOut
        onComplete={(sparks) => handleGameComplete('odd-one-out', sparks)}
        onBack={() => setHubState('menu')}
      />
    );
  }
  if (hubState === 'shadow-match') {
    return (
      <ShadowMatch
        onComplete={(sparks) => handleGameComplete('shadow-match', sparks)}
        onBack={() => setHubState('menu')}
      />
    );
  }
  if (hubState === 'memory-cards') {
    return (
      <MemoryCards
        onComplete={(sparks) => handleGameComplete('memory-cards', sparks)}
        onBack={() => setHubState('menu')}
      />
    );
  }

  // ── All-complete celebration ───────────────────────────────────────────────
  if (hubState === 'all-complete') {
    const celebEmojis = ['🧩', '🤔', '🖼️', '🃏', '✨', '⭐', '💫', '🌟', '🎉', '🎊', '🏆', '💡']
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
      >
        <StarParticles />

        {celebEmojis.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl pointer-events-none"
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.8, 1],
              x: Math.cos((i / 12) * Math.PI * 2) * 160,
              y: Math.sin((i / 12) * Math.PI * 2) * 160,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1, delay: i * 0.06, ease: 'easeOut' }}
          >
            {emoji}
          </motion.span>
        ))}

        <motion.div
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Character mood="excited" size={160} hairColor={hairColor} outfitColor={outfitColor} />

          <motion.h1
            className="text-4xl font-bold"
            style={{
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {isRTL ? '🎉 כל הכבוד! גמרת הכל!' : '🎉 Amazing! You did it all!'}
          </motion.h1>

          {lastEarned > 0 && (
            <motion.div
              className="flex items-center gap-3 bg-kpop-card/80 rounded-3xl px-6 py-3 border border-kpop-gold/40"
              style={{ boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.span className="text-3xl" animate={{ rotate: [0, 360] }} transition={{ duration: 1, delay: 0.7 }}>
                ✨
              </motion.span>
              <div>
                <p className="text-kpop-gold font-bold text-3xl ltr-number"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}>
                  +{lastEarned}
                </p>
                <p className="text-white/50 text-sm">
                  {isRTL ? 'ניצוצות הרווחת!' : 'sparks earned!'}
                </p>
              </div>
            </motion.div>
          )}

          <motion.button
            className="mt-2 rounded-3xl px-10 py-4 font-bold text-white text-xl border border-kpop-purple/50"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              boxShadow: '0 0 30px rgba(139,92,246,0.5)',
              fontFamily: 'Fredoka One, Nunito, sans-serif',
              minHeight: 72,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/home')}
          >
            {isRTL ? '← חזרה לבית' : 'Back to Home →'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1E1B2E 0%, #2D1B4E 100%)' }}
    >
      <StarParticles />

      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2 safe-top">
        <motion.button
          className="flex items-center gap-1.5 text-white/60 font-bold
                     bg-kpop-card/60 px-3 py-2 rounded-full border border-white/10 text-base"
          whileTap={{ scale: 0.93 }}
          onClick={() => navigate('/home')}
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          <span>{isRTL ? '→' : '←'}</span>
          {s.back}
        </motion.button>

        <h1
          className="font-bold text-white text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          🧩 {isRTL ? 'חדר האתגר' : 'Challenge Room'}
        </h1>

        <SparkCounter />
      </div>

      <div className="relative z-10 flex justify-center pt-1">
        <Character
          mood={allComplete ? 'excited' : 'happy'}
          size={100}
          hairColor={hairColor}
          outfitColor={outfitColor}
        />
      </div>

      <motion.p
        className="relative z-10 text-center text-white/60 px-6 pb-2 text-base"
        style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isRTL
          ? 'כל הופעה מתחילה בחידה!'
          : 'Every show starts with a puzzle!'}
      </motion.p>

      <div className="relative z-10 flex-1 overflow-y-auto scrollable px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {GAME_CARDS.map((game, i) => {
            const done = isGameCompleted('logic', game.id);
            return (
              <motion.button
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200 }}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setHubState(game.id)}
                className="relative rounded-3xl p-4 border border-white/10 text-start
                           flex flex-col gap-2 overflow-hidden min-h-[140px]"
                style={{
                  background: done
                    ? `linear-gradient(135deg, ${game.color}44, rgba(45,42,74,0.9))`
                    : `linear-gradient(135deg, ${game.color}22, rgba(45,42,74,0.95))`,
                  boxShadow: done ? `0 0 20px ${game.glowColor}` : 'none',
                }}
              >
                <div
                  className="absolute top-0 end-0 w-16 h-16 rounded-full opacity-25 pointer-events-none"
                  style={{
                    background: game.color,
                    filter: 'blur(14px)',
                    transform: 'translate(40%, -40%)',
                  }}
                />

                <span className="text-4xl">{game.emoji}</span>

                <h3
                  className="font-bold text-white text-base leading-tight"
                  style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                >
                  {language === 'he' ? game.titleHe : game.titleEn}
                </h3>

                <p
                  className="text-white/50 text-xs leading-snug"
                  style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}
                >
                  {language === 'he' ? game.descHe : game.descEn}
                </p>

                {done && (
                  <motion.div
                    className="absolute top-2 end-2 text-kpop-gold text-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    ⭐
                  </motion.div>
                )}

                {!done && (
                  <motion.div
                    className="absolute top-2 end-2 w-2.5 h-2.5 rounded-full"
                    style={{ background: game.color }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {allComplete && (
          <motion.div
            className="mt-4 rounded-3xl p-4 border border-kpop-gold/40 text-center"
            style={{ background: 'rgba(245,158,11,0.1)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="text-kpop-gold font-bold text-xl"
              style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
            >
              🏆 {isRTL ? 'כל המשחקים הושלמו!' : 'All games completed!'}
            </p>
            <p className="text-white/50 text-sm mt-1"
              style={{ fontFamily: 'Nunito, Heebo, sans-serif' }}>
              {isRTL ? 'תוכלי לשחק שוב לתרגול!' : 'Play again for more practice!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
