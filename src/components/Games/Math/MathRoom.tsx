import { RoomHub } from '../RoomHub'
import type { GameConfig } from '../RoomHub'
import { CountingGame } from './CountingGame'
import { ComparisonGame } from './ComparisonGame'
import { AddSubGame } from './AddSubGame'
import { PatternGame } from './PatternGame'
import { NumberRecognition } from './NumberRecognition'
import { NumberTracing } from './NumberTracing'

// ─── Math Room — "The Beat & Numbers" ────────────────────────────────────────
// To add a game: add one entry below. That's it.

const GAMES: GameConfig[] = [
  {
    id: 'counting',
    component: CountingGame,
    emoji: '🔢',
    titleHe: 'ספירה',
    titleEn: 'Counting',
    descHe: 'ספרי את האיקסים על הבמה',
    descEn: 'Count the objects on stage',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  {
    id: 'comparison',
    component: ComparisonGame,
    emoji: '⚖️',
    titleHe: 'השוואה',
    titleEn: 'Comparison',
    descHe: 'איזה צד גדול יותר?',
    descEn: 'Which side has more?',
    color: '#7C3AED',
    glowColor: 'rgba(124,58,237,0.4)',
  },
  {
    id: 'add-sub',
    component: AddSubGame,
    emoji: '➕',
    titleHe: 'חיבור וחיסור',
    titleEn: 'Add & Subtract',
    descHe: 'פתרי את החשבון',
    descEn: 'Solve the equation',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'patterns',
    component: PatternGame,
    emoji: '🔄',
    titleHe: 'תבניות',
    titleEn: 'Patterns',
    descHe: 'מה הולך הלאה?',
    descEn: 'What comes next?',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
  },
  {
    id: 'number-recognition',
    component: NumberRecognition,
    emoji: '🔍',
    titleHe: 'זיהוי מספרים',
    titleEn: 'Number Recognition',
    descHe: 'מצאי את הקבוצה הנכונה',
    descEn: 'Find the matching group',
    color: '#10B981',
    glowColor: 'rgba(16,185,129,0.4)',
    celebEmojis: ['✨', '⭐', '💫', '🌟', '✦', '★', '🎉', '🎊', '🔢', '🏆', '🎵', '🎤'],
  },
  {
    id: 'number-tracing',
    component: NumberTracing,
    emoji: '✍️',
    titleHe: 'כתיבת מספרים',
    titleEn: 'Number Writing',
    descHe: 'עקבי אחרי המספרים באצבע',
    descEn: 'Trace the numbers with your finger',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    celebEmojis: ['✍️', '🔢', '⭐', '💫', '🌟', '🎉', '✨', '🏆'],
  },
]

export function MathRoom() {
  return (
    <RoomHub
      roomId="math"
      titleHe="🔢 אולפן הקצב"
      titleEn="🔢 Beat Studio"
      subtitleHe="שירים צריכים ספירה — בואי נחשב!"
      subtitleEn="Songs need counting — let's do the math!"
      games={GAMES}
    />
  )
}
