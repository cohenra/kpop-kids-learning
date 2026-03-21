// ─── Daily Missions ────────────────────────────────────────────────────────────
//
// Each mission is a "call for help" from one band member.
// A new mission is picked every day (deterministic from date).
// Completing gamesRequired games in any room earns the bonus sparks.
//
// memberId must match a BandMember id from rewards.ts.
// roomHint is where to navigate when child taps "play now".

export interface DailyMission {
  id: string
  memberId: string       // which band member is calling for help
  memberNameHe: string
  memberNameEn: string
  emoji: string          // mission flavor emoji
  textHe: string         // what the member says (shown in banner)
  textEn: string
  ttsHe: string          // shorter version read aloud via TTS
  ttsEn: string
  roomHint: string       // suggested room id
  gamesRequired: number  // always 2 — achievable in one short session
}

// Bonus sparks awarded when the daily mission is completed
export const MISSION_BONUS_SPARKS = 50

export const DAILY_MISSIONS: DailyMission[] = [
  // ── 0 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-literacy-luna',
    memberId: 'luna',
    memberNameHe: 'לונה',
    memberNameEn: 'Luna',
    emoji: '📝',
    textHe: 'לונה כותבת שיר חדש — היא צריכה מילים יפות! עזרי לה לשחק 2 משחקי קריאה!',
    textEn: 'Luna is writing a new song — she needs beautiful words! Help her with 2 literacy games!',
    ttsHe: 'לונה צריכה אותך! עזרי לה עם משחקי קריאה היום!',
    ttsEn: 'Luna needs you! Help her with literacy games today!',
    roomHint: 'literacy',
    gamesRequired: 2,
  },
  // ── 1 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-math-pixel',
    memberId: 'pixel',
    memberNameHe: 'פיקסל',
    memberNameEn: 'Pixel',
    emoji: '🎧',
    textHe: 'פיקסל מכינה ביטים לשיר החדש — היא צריכה לספור את הקצבים! שחקי 2 משחקי מתמטיקה!',
    textEn: 'Pixel is making beats for the new song — she needs to count the rhythms! Play 2 math games!',
    ttsHe: 'פיקסל צריכה עזרה! שחקי משחקי מתמטיקה היום!',
    ttsEn: 'Pixel needs help! Play math games today!',
    roomHint: 'math',
    gamesRequired: 2,
  },
  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-music-nova',
    memberId: 'nova',
    memberNameHe: 'נובה',
    memberNameEn: 'Nova',
    emoji: '💃',
    textHe: 'נובה מאמנת כוריאוגרפיה חדשה — היא צריכה לתרגל את הקצב! שחקי 2 משחקי מוסיקה!',
    textEn: 'Nova is rehearsing new choreography — she needs to practice the rhythm! Play 2 music games!',
    ttsHe: 'נובה צריכה אותך! שחקי משחקי מוסיקה היום!',
    ttsEn: 'Nova needs you! Play music games today!',
    roomHint: 'music',
    gamesRequired: 2,
  },
  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-logic-star',
    memberId: 'star',
    memberNameHe: 'סטאר',
    memberNameEn: 'Star',
    emoji: '🎵',
    textHe: 'סטאר כותבת ראפ ונתקעת בחידה! עזרי לה לחשוב — שחקי 2 משחקי חשיבה!',
    textEn: 'Star is writing rap and got stuck on a puzzle! Help her think — play 2 logic games!',
    ttsHe: 'סטאר נתקעת! עזרי לה עם משחקי חשיבה היום!',
    ttsEn: 'Star is stuck! Help her with logic games today!',
    roomHint: 'logic',
    gamesRequired: 2,
  },
  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-literacy-aria',
    memberId: 'aria',
    memberNameHe: 'אריה',
    memberNameEn: 'Aria',
    emoji: '💫',
    textHe: 'אריה קוראת את תסריט ראיון הטלוויזיה — עזרי לה לתרגל! שחקי 2 משחקי קריאה!',
    textEn: 'Aria is reading the TV interview script — help her practice! Play 2 literacy games!',
    ttsHe: 'אריה צריכה עזרה! שחקי משחקי קריאה היום!',
    ttsEn: 'Aria needs help! Play literacy games today!',
    roomHint: 'literacy',
    gamesRequired: 2,
  },
  // ── 5 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-math-kiki',
    memberId: 'kiki',
    memberNameHe: 'קיקי',
    memberNameEn: 'Kiki',
    emoji: '🌟',
    textHe: 'קיקי ספרה את כרטיסי הקונצרט ואיבדה חשבון! עזרי לה — שחקי 2 משחקי מספרים!',
    textEn: 'Kiki lost count of the concert tickets! Help her — play 2 math games!',
    ttsHe: 'קיקי צריכה אותך! שחקי משחקי מספרים היום!',
    ttsEn: 'Kiki needs you! Play math games today!',
    roomHint: 'math',
    gamesRequired: 2,
  },
  // ── 6 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-music-star',
    memberId: 'star',
    memberNameHe: 'סטאר',
    memberNameEn: 'Star',
    emoji: '🎤',
    textHe: 'סטאר מחפשת מנגינה לשיר החדש שלה — עזרי לה! שחקי 2 משחקי מוסיקה!',
    textEn: 'Star is searching for a melody for her new song — help her! Play 2 music games!',
    ttsHe: 'סטאר מחפשת מנגינה! עזרי לה עם משחקי מוסיקה היום!',
    ttsEn: 'Star needs a melody! Play music games today!',
    roomHint: 'music',
    gamesRequired: 2,
  },
  // ── 7 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-logic-luna',
    memberId: 'luna',
    memberNameHe: 'לונה',
    memberNameEn: 'Luna',
    emoji: '🧩',
    textHe: 'לונה מתאמנת את הזיכרון לפני ההופעה הגדולה! עזרי לה — שחקי 2 משחקי חשיבה!',
    textEn: 'Luna is training her memory before the big show! Help her — play 2 logic games!',
    ttsHe: 'לונה מתאמנת! עזרי לה עם משחקי חשיבה היום!',
    ttsEn: 'Luna is training! Help her with logic games today!',
    roomHint: 'logic',
    gamesRequired: 2,
  },
  // ── 8 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-literacy-nova',
    memberId: 'nova',
    memberNameHe: 'נובה',
    memberNameEn: 'Nova',
    emoji: '🌈',
    textHe: 'נובה לומדת את מילות המחול בשיר החדש — עזרי לה! שחקי 2 משחקי מילים!',
    textEn: 'Nova is learning the dance lyrics of the new song — help her! Play 2 word games!',
    ttsHe: 'נובה לומדת מילים! עזרי לה עם משחקי קריאה היום!',
    ttsEn: 'Nova is learning words! Help her with literacy games today!',
    roomHint: 'literacy',
    gamesRequired: 2,
  },
  // ── 9 ──────────────────────────────────────────────────────────────────────
  {
    id: 'mission-math-aria',
    memberId: 'aria',
    memberNameHe: 'אריה',
    memberNameEn: 'Aria',
    emoji: '🎨',
    textHe: 'אריה מעצבת תלבושות ריקוד וצריכה לספור בדים — עזרי לה! שחקי 2 משחקי מספרים!',
    textEn: 'Aria is designing dance costumes and needs to count the fabrics — help her! Play 2 math games!',
    ttsHe: 'אריה מעצבת תלבושות! עזרי לה עם משחקי מספרים היום!',
    ttsEn: 'Aria is designing costumes! Play math games today!',
    roomHint: 'math',
    gamesRequired: 2,
  },
]
