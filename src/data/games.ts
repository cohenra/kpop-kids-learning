// ─── Room and game definitions ─────────────────────────────────────────────────

export type RoomId =
  | 'literacy'
  | 'math'
  | 'music'
  | 'social'
  | 'nature'
  | 'logic'

export interface Room {
  id: RoomId
  emoji: string
  color: string
  glowColor: string
  available: boolean // Phase gating: only literacy + math available in Phase 1
}

export const ROOMS: Room[] = [
  {
    id: 'literacy',
    emoji: '📚',
    color: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.4)',
    available: true,
  },
  {
    id: 'math',
    emoji: '🔢',
    color: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    available: true,
  },
  {
    id: 'music',
    emoji: '🎵',
    color: '#06B6D4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    available: true,
  },
  {
    id: 'social',
    emoji: '👨‍👩‍👧',
    color: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    available: false,
  },
  {
    id: 'nature',
    emoji: '🌿',
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    available: false,
  },
  {
    id: 'logic',
    emoji: '🧩',
    color: '#8B5CF6',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    available: true,
  },
]

// Sparks earned per completed game, by age profile
export const SPARKS_PER_GAME: Record<3 | 5, number> = {
  3: 5,
  5: 8,
}
