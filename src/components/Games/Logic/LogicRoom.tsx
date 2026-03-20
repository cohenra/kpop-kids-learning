import { RoomHub } from '../RoomHub'
import type { GameConfig } from '../RoomHub'
import { JigsawPuzzle } from './JigsawPuzzle'
import { OddOneOut } from './OddOneOut'
import { ShadowMatch } from './ShadowMatch'
import { MemoryCards } from './MemoryCards'

// ─── Logic Room — "The Challenge Room" ───────────────────────────────────────
// To add a game: add one entry below. That's it.

const GAMES: GameConfig[] = [
  {
    id: 'jigsaw-puzzle',
    component: JigsawPuzzle,
    emoji: '🧩',
    titleHe: 'פאזל',
    titleEn: 'Jigsaw Puzzle',
    descHe: 'הרכיבי את התמונה',
    descEn: 'Assemble the picture',
    color: '#8B5CF6',
    glowColor: 'rgba(139,92,246,0.4)',
  },
  {
    id: 'odd-one-out',
    component: OddOneOut,
    emoji: '🤔',
    titleHe: 'מה לא שייך?',
    titleEn: 'Odd One Out',
    descHe: 'מצאי את הפריט השונה',
    descEn: 'Find the different item',
    color: '#EC4899',
    glowColor: 'rgba(236,72,153,0.4)',
  },
  {
    id: 'shadow-match',
    component: ShadowMatch,
    emoji: '🖼️',
    titleHe: 'התאמת צללים',
    titleEn: 'Shadow Match',
    descHe: 'התאימי את הצללית הנכונה',
    descEn: 'Match the correct shadow',
    color: '#06B6D4',
    glowColor: 'rgba(6,182,212,0.4)',
  },
  {
    id: 'memory-cards',
    component: MemoryCards,
    emoji: '🃏',
    titleHe: 'קלפי זיכרון',
    titleEn: 'Memory Cards',
    descHe: 'מצאי את הזוגות',
    descEn: 'Find the matching pairs',
    color: '#F59E0B',
    glowColor: 'rgba(245,158,11,0.4)',
    celebEmojis: ['✨', '⭐', '💫', '🌟', '🧩', '🃏', '🎉', '🎊', '💥', '🏆', '🎵', '🎤'],
  },
]

export function LogicRoom() {
  return (
    <RoomHub
      roomId="logic"
      titleHe="🧩 חדר האתגרים"
      titleEn="🧩 Challenge Room"
      subtitleHe="כל הופעה מתחילה בחידה — בואי לפתור!"
      subtitleEn="Every show starts with a puzzle — let's solve it!"
      games={GAMES}
    />
  )
}
