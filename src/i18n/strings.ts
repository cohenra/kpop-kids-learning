// ─── i18n string definitions ──────────────────────────────────────────────────

export type Language = 'he' | 'en'

export interface Strings {
  // Welcome
  welcomeTitle: string
  welcomeSubtitle: string
  characterNamePrompt: string
  characterNamePlaceholder: string
  startButton: string
  welcomeAge3: string
  welcomeAge5: string
  chooseAge: string

  // Profile Select
  chooseProfile: string
  addProfile: string
  sparks: string
  profile: string
  tapToPlay: string

  // Home
  homeGreeting: string
  myStage: string
  langToggle: string
  rooms: {
    literacy: { name: string; tagline: string }
    math: { name: string; tagline: string }
    music: { name: string; tagline: string }
    social: { name: string; tagline: string }
    nature: { name: string; tagline: string }
    logic: { name: string; tagline: string }
  }
  comingSoon: string
  locked: string

  // Stage
  myStageTitle: string
  stageProgress: string
  nextUnlock: string
  sparksToUnlock: string
  stageItems: {
    floor: string
    lighting: string
    ledWall: string
    effects: string
    curtains: string
    audience: string
  }
  bandSection: string
  concertSection: string
  allUnlocked: string

  // General
  back: string
  settings: string
  parentMode: string
  tryAgain: string
  wellDone: string
  amazing: string
  keepGoing: string

  // Games
  games: {
    rhythmTap: string
    rhythmTapIntro: string
    instrumentRecognition: string
    instrumentRecognitionIntro: string
    playAgain: string
    melodySequence: string
    melodySequenceWatch: string
    melodySequenceRepeat: string
    freePiano: string
    freePianoIntro: string
    beautifulMusic: string
    startRecording: string
    stopRecording: string
  }
  round: string
  start: string
  roundOver: string
  sparksThisRound: string
  nextRound: string
  finishGame: string
  goodJob: string
  sparksEarned: string
  score: string
}

const he: Strings = {
  welcomeTitle: '✨ ברוכה הבאה לאקדמיית הכוכבים!',
  welcomeSubtitle: 'בואי לעזור לכוכבת שלך לעלות לבמה!',
  characterNamePrompt: 'מה שם הכוכבת שלך?',
  characterNamePlaceholder: 'הכניסי שם...',
  startButton: 'בואי נתחיל! 🌟',
  welcomeAge3: 'גיל 3',
  welcomeAge5: 'גיל 5',
  chooseAge: 'כמה את בת?',

  chooseProfile: 'מי משחקת עכשיו?',
  addProfile: 'הוסיפי פרופיל',
  sparks: 'ניצוצות',
  profile: 'פרופיל',
  tapToPlay: 'לחצי להמשיך!',

  homeGreeting: 'שלום',
  myStage: 'הבמה שלי 🎭',
  langToggle: 'EN',
  rooms: {
    literacy: { name: 'אולפן המילים', tagline: 'כתוב מילים לשיר!' },
    math: { name: 'אולפן הריתמוס', tagline: 'ספרי פעימות!' },
    music: { name: 'חדר הריקודים', tagline: 'תחזרי על הקצב!' },
    social: { name: 'חדר הירוק', tagline: 'רגשות וחברים!' },
    nature: { name: 'הגינה', tagline: 'טבע מאחורי הבמה!' },
    logic: { name: 'חדר האתגרים', tagline: 'פתרי חידות!' },
  },
  comingSoon: 'בקרוב!',
  locked: 'נעול 🔒',

  myStageTitle: 'הבמה שלי',
  stageProgress: 'התקדמות',
  nextUnlock: 'הפריט הבא:',
  sparksToUnlock: 'ניצוצות לפתיחה',
  stageItems: {
    floor: 'רצפת הבמה',
    lighting: 'תאורת במה',
    ledWall: 'מסך LED',
    effects: 'אפקטים מיוחדים',
    curtains: 'וילונות',
    audience: 'קהל',
  },
  bandSection: 'חברי הלהקה',
  concertSection: 'הקונצרט',
  allUnlocked: 'הכל נפתח! 🎉',

  back: 'חזרה',
  settings: 'הגדרות',
  parentMode: 'מצב הורים',
  tryAgain: 'נסי שוב! 💪',
  wellDone: 'כל הכבוד! ⭐',
  amazing: 'מדהים! 🌟',
  keepGoing: 'המשיכי! 💫',

  games: {
    rhythmTap: 'הקשה לקצב',
    rhythmTapIntro: 'הקשי לקצב והקישי בזמן!',
    instrumentRecognition: 'זיהוי כלים',
    instrumentRecognitionIntro: 'איזה כלי את שומעת?',
    playAgain: 'נגני שוב',
    melodySequence: 'סדר מנגינה',
    melodySequenceWatch: 'צפי ברצף',
    melodySequenceRepeat: 'חזרי על הרצף',
    freePiano: 'פסנתר חופשי',
    freePianoIntro: 'נגני מוזיקה משלך!',
    beautifulMusic: 'מוזיקה יפה!',
    startRecording: 'התחל הקלטה',
    stopRecording: 'עצור הקלטה',
  },
  round: 'סיבוב',
  start: 'התחל',
  roundOver: 'הסיבוב נגמר!',
  sparksThisRound: 'ניצוצות בסיבוב: {count}',
  nextRound: 'לסיבוב הבא',
  finishGame: 'סיום המשחק',
  goodJob: 'כל הכבוד!',
  sparksEarned: 'הרווחת {count} ניצוצות!',
  score: 'ניקוד',
}

const en: Strings = {
  welcomeTitle: '✨ Welcome to Star Academy!',
  welcomeSubtitle: "Let's help your star reach the stage!",
  characterNamePrompt: "What's your star's name?",
  characterNamePlaceholder: 'Enter a name...',
  startButton: "Let's Go! 🌟",
  welcomeAge3: 'Age 3',
  welcomeAge5: 'Age 5',
  chooseAge: 'How old are you?',

  chooseProfile: "Who's playing?",
  addProfile: 'Add Profile',
  sparks: 'sparks',
  profile: 'Profile',
  tapToPlay: 'Tap to play!',

  homeGreeting: 'Hi',
  myStage: 'My Stage 🎭',
  langToggle: 'עב',
  rooms: {
    literacy: { name: 'Lyrics Studio', tagline: 'Write song lyrics!' },
    math: { name: 'Beat Studio', tagline: 'Count the beats!' },
    music: { name: 'Dance Studio', tagline: 'Follow the rhythm!' },
    social: { name: 'Green Room', tagline: 'Feelings & friends!' },
    nature: { name: 'The Garden', tagline: 'Nature backstage!' },
    logic: { name: 'Challenge Room', tagline: 'Solve puzzles!' },
  },
  comingSoon: 'Coming Soon!',
  locked: 'Locked 🔒',

  myStageTitle: 'My Stage',
  stageProgress: 'Progress',
  nextUnlock: 'Next Unlock:',
  sparksToUnlock: 'sparks to unlock',
  stageItems: {
    floor: 'Stage Floor',
    lighting: 'Stage Lighting',
    ledWall: 'LED Wall',
    effects: 'Special Effects',
    curtains: 'Curtains',
    audience: 'Audience',
  },
  bandSection: 'Band Members',
  concertSection: 'The Concert',
  allUnlocked: 'All Unlocked! 🎉',

  back: 'Back',
  settings: 'Settings',
  parentMode: 'Parent Mode',
  tryAgain: 'Try Again! 💪',
  wellDone: 'Well Done! ⭐',
  amazing: 'Amazing! 🌟',
  keepGoing: 'Keep Going! 💫',

  games: {
    rhythmTap: 'Rhythm Tap',
    rhythmTapIntro: 'Listen to the beat and tap in time!',
    instrumentRecognition: 'Instrument Recognition',
    instrumentRecognitionIntro: 'Which instrument do you hear?',
    playAgain: 'Play Sound Again',
    melodySequence: 'Melody Sequence',
    melodySequenceWatch: 'Watch the sequence',
    melodySequenceRepeat: 'Repeat the sequence',
    freePiano: 'Free Piano',
    freePianoIntro: 'Play some music!',
    beautifulMusic: 'Beautiful music!',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
  },
  round: 'Round',
  start: 'Start',
  roundOver: 'Round Over!',
  sparksThisRound: 'Sparks this round: {count}',
  nextRound: 'Next Round',
  finishGame: 'Finish Game',
  goodJob: 'Good Job!',
  sparksEarned: 'You earned {count} sparks!',
  score: 'Score',
}

export const strings: Record<Language, Strings> = { he, en }

export function t(lang: Language): Strings {
  return strings[lang]
}
