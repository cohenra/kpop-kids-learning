import { RoomHub } from '../RoomHub'
import type { GameConfig, GameComponentProps } from '../RoomHub'
import { RhythmTap } from './RhythmTap'
import { InstrumentRecognition } from './InstrumentRecognition'
import { MelodySequence } from './MelodySequence'
import { FreePiano } from './FreePiano'

// ─── Music Room — "The Dance Studio" ─────────────────────────────────────────
// To add a game: add one entry below. That's it.

// FreePiano only accepts onBack (it's a free-play toy, not a completable game).
// This wrapper makes it compatible with RoomHub's GameComponentProps interface.
function FreePianoWrapper({ onBack }: GameComponentProps) {
  return <FreePiano onBack={onBack} />
}

const GAMES: GameConfig[] = [
  {
    id: 'rhythm-tap',
    component: RhythmTap,
    emoji: '🥁',
    titleHe: 'הקשה לקצב',
    titleEn: 'Rhythm Tap',
    descHe: 'הקישי לקצב בזמן',
    descEn: 'Tap in time with the beat',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  {
    id: 'instrument-recognition',
    component: InstrumentRecognition,
    emoji: '🎺',
    titleHe: 'זיהוי כלים',
    titleEn: 'Instrument Recognition',
    descHe: 'איזה כלי את שומעת?',
    descEn: 'Which instrument do you hear?',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'melody-sequence',
    component: MelodySequence,
    emoji: '🎶',
    titleHe: 'סדר מנגינה',
    titleEn: 'Melody Sequence',
    descHe: 'חזרי על המנגינה',
    descEn: 'Repeat the melody',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'free-piano',
    component: FreePianoWrapper,
    emoji: '🎹',
    titleHe: 'פסנתר חופשי',
    titleEn: 'Free Piano',
    descHe: 'נגני מוזיקה משלך',
    descEn: 'Play your own music',
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.4)',
    freePlay: true,   // ← free-play: not tracked as completed
    celebEmojis: ['✨', '⭐', '💫', '🌟', '🎵', '🎶', '🎤', '🎹', '🥁', '🎺', '🎉', '🎊'],
  },
]

export function MusicRoom() {
  return (
    <RoomHub
      roomId="music"
      titleHe="🎵 חדר הריקודים"
      titleEn="🎵 Dance Studio"
      subtitleHe="הכוכבת שלך צריכה לחזור — בואי לרקוד!"
      subtitleEn="Your star needs to rehearse — let's dance!"
      games={GAMES}
    />
  )
}
