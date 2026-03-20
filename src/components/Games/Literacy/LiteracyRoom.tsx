import { RoomHub } from '../RoomHub'
import type { GameConfig } from '../RoomHub'
import { LetterRecognition } from './LetterRecognition'
import { WordCompletion } from './WordCompletion'
import { FirstReading } from './FirstReading'
import { FingerWriting } from './FingerWriting'

// ─── Literacy Room — "The Lyrics Studio" ─────────────────────────────────────
// To add a game: add one entry below. That's it.

const GAMES: GameConfig[] = [
  {
    id: 'letter-recognition',
    component: LetterRecognition,
    emoji: '🔤',
    titleHe: 'זיהוי אותיות',
    titleEn: 'Letter Recognition',
    descHe: 'הכירי אותיות לפי הצליל',
    descEn: 'Recognize letters by sound',
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.4)',
  },
  {
    id: 'word-completion',
    component: WordCompletion,
    emoji: '🔡',
    titleHe: 'השלמת מילה',
    titleEn: 'Word Completion',
    descHe: 'מצאי את האות החסרה',
    descEn: 'Find the missing letter',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'first-reading',
    component: FirstReading,
    emoji: '📖',
    titleHe: 'קריאה ראשונה',
    titleEn: 'First Reading',
    descHe: 'קראי מילים ומשפטים',
    descEn: 'Read words and sentences',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  {
    id: 'finger-writing',
    component: FingerWriting,
    emoji: '✍️',
    titleHe: 'כתיבה באצבע',
    titleEn: 'Finger Writing',
    descHe: 'עקבי אחרי האות',
    descEn: 'Trace the letter',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    celebEmojis: ['✨', '⭐', '💫', '🌟', '✦', '★', '🎉', '🎊', '💥', '🏆', '🎵', '🎤'],
  },
]

export function LiteracyRoom() {
  return (
    <RoomHub
      roomId="literacy"
      titleHe="📚 אולפן המילים"
      titleEn="📚 Lyrics Studio"
      subtitleHe="הכוכבת שלך צריכה מילים לשיר — בואי לעזור!"
      subtitleEn="Your star needs lyrics — help her write them!"
      games={GAMES}
    />
  )
}
