// ─── Music Room game content ────────────────────────────────────────────────

export interface Instrument {
  id: 'drum' | 'piano' | 'guitar' | 'trumpet';
  nameHe: string;
  nameEn: string;
  emoji: string;
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'drum',    nameHe: 'תוף',     nameEn: 'Drum',    emoji: '🥁' },
  { id: 'piano',   nameHe: 'פסנתר',   nameEn: 'Piano',   emoji: '🎹' },
  { id: 'guitar',  nameHe: 'גיטרה',   nameEn: 'Guitar',  emoji: '🎸' },
  { id: 'trumpet', nameHe: 'חצוצרה',  nameEn: 'Trumpet', emoji: '🎺' },
];

export interface MelodyNote {
  note: string; // e.g., 'C4', 'D4'
  color: string;
}

export const MELODY_NOTES: MelodyNote[] = [
  { note: 'C4', color: '#EC4899' },
  { note: 'D4', color: '#F59E0B' },
  { note: 'E4', color: '#10B981' },
  { note: 'F4', color: '#06B6D4' },
  { note: 'G4', color: '#8B5CF6' },
];

/** Fisher-Yates shuffle — returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick n random items from arr, no duplicates */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}