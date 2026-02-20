Project Overview
An educational PWA (Progressive Web App) for children aged 3–5, built around a K-POP theme.
The child helps their character become a pop star by completing educational mini-games.
Every completed game earns "star sparks" ✨ which are used to build a stage and grow a pop group.
The app must work fully offline (local file or localhost), with future deployment to Vercel/Netlify.
Tech Stack

React 18 + Vite + TypeScript
Tailwind CSS (styling)
Framer Motion (animations)
React Router v6 (navigation)
vite-plugin-pwa (PWA + offline support)
Web Speech API (text-to-speech for instructions, free, built into browser)
LocalStorage (all persistence — no backend)

Target Users

Child profile 1: Age 5 — more complex games, 4 answer choices, basic reading
Child profile 2: Age 3 — simpler games, 2 answer choices, audio-only instructions
Parent: Has a locked "Parent Mode" accessible via 3-second logo press + 4-digit PIN

Character System

On first launch, the app asks the child to name their character (text input + voice)
Character name is saved to LocalStorage and editable in settings
Character is a small anime-style K-POP girl with large eyes, colorful hair, musical outfit
Character reacts emotionally: happy when correct, encouraging (never disappointed) when wrong
Character starts plain and unlocks outfits/accessories as sparks are earned

Progress & Reward System — "The Road to the Concert"
Phase 1: Build the Stage (earned first)
Unlock stage elements in this order by earning sparks:

Floor / platform
Stage lighting
Background screen (LED wall)
Special effects (confetti, lasers)
Curtains
Audience

Phase 2: Build the Group (unlocked after full stage)
6 bandmates unlock one by one, each with:

Unique name, appearance, role (vocalist, dancer, rapper, DJ, visual, maknae)
Small intro animation when unlocked

Phase 3: The Concert
When stage is complete + all 6 members unlocked:

Full concert animation with the child's named character on stage
Then "Season 2" begins with a new goal (world tour, movie, etc.)

Currency: Star Sparks ✨

Earned for every completed game and every level-up
Amount varies by difficulty and age profile
Displayed persistently in the top corner of the screen

Game Rooms — Full Map
1. 📚 Learning Room — "The Lyrics Studio"
Tagline: "Your star needs to write song lyrics — help her!"
Games:

Letter Recognition: Hear a letter sound → tap the correct letter (age 3: 2 choices, age 5: 4 choices)
Word Completion: See a picture → find the missing letter/sound
First Reading: age 3: 2–3 letter words with audio; age 5: short sentence reading
Finger Writing: Trace a letter with your finger on screen
Available in both Hebrew and English (player selects language at session start)
Hebrew uses RTL layout automatically

2. 🔢 Recording Studio — "The Beat & Numbers"
Tagline: "Songs need counting — how many beats in this chorus?"
Games:

Counting: age 3: count stars up to 10; age 5: skip-count up to 30
Comparison: More/less/equal using stage props as visual objects
Addition/Subtraction: age 3: fingers + objects; age 5: up to 20
Patterns: Complete a color+shape sequence on the stage floor

3. 🎵 Dance Studio — "The Choreography Room"
Tagline: "The star needs to rehearse — follow the rhythm!"
Games:

Rhythm Tap: Tap the screen in time with the beat
Instrument Recognition: Is that a guitar or a drum?
Melody Sequence: Repeat a short musical pattern
Free Play: Play a simple on-screen piano/xylophone

4. 👨‍👩‍👧 The Green Room — "The Star's Feelings"
Tagline: "The star has friends and family — how do we handle situations together?"
Games:

Social Dilemmas: "Your friend is sad — what do you do?" (3 illustrated choices)
Emotion Recognition: Match facial expression to emotion word/emoji
Family Roles: "Who is uncle/grandma/sibling?" — illustrated family tree
Sharing & Helping: Choose the kind/correct action in a situation

5. 🌿 The Garden — "Nature Behind the Stage"
Tagline: "The star loves nature between shows"
Games:

Animal Identification: See/hear animal → name it or match it
Life Cycles: Drag items into correct order (egg → chick → bird)
Weather Dressing: "What should the star wear today?" — match clothing to weather
Body Awareness: "What hurts?" — illustrated body with labeled parts

6. 🧩 The Challenge Room — "Pre-Show Puzzle"
Tagline: "Every show starts with a puzzle!"
Games:

Jigsaw Puzzle: 4 pieces (age 3) → 9 pieces (age 5) → 16 pieces (advanced)
Odd One Out: Find the item that doesn't belong in the group
Shadow Matching: Match the silhouette to the correct object
Memory Cards: Flip and match pairs (4 pairs age 3, 8 pairs age 5)

Two Child Profiles
The app supports two saved profiles (for the two sisters):

Each profile has its own: character name, age setting, progress, sparks, unlocked items
Profile switcher is accessible from the main screen (large avatar buttons)
Each profile stores independently in LocalStorage

Parent Mode
Access: Press and hold the app logo for 3 seconds → enter 4-digit PIN (set on first use)
Features:

Progress Dashboard: Time played, games completed, categories, levels reached — per child
Visual Progress Map: See exactly where each child is in each room
Room Lock/Unlock: Enable or disable specific game rooms or individual games
Settings:

Change character name
Change age profile (3 or 5)
Change preferred language (Hebrew/English)
Reset progress
Change PIN


Weekly Report: Summary card (shareable as screenshot)

Design System
Color Palette (K-POP aesthetic)

Primary: Deep purple #7C3AED
Accent 1: Hot pink #EC4899
Accent 2: Cyan #06B6D4
Accent 3: Gold #F59E0B
Background: Dark #1E1B2E (feels like a concert venue)
Cards: #2D2A4A
Text on dark: White #F9FAFB

Typography

Headings: Rounded, bubbly font (Nunito or Fredoka One from Google Fonts)
Body: Clean, large, highly readable
Hebrew: Heebo or Assistant (Google Fonts, excellent Hebrew support)
Minimum font size: 18px for child-facing text

Touch Targets

Minimum tap target: 60x60px (age 3 profile: 80x80px)
Generous spacing between interactive elements
No small icons without text labels in child-facing UI

Animation Principles

All correct answers: celebratory animation (sparkles, bounce, character dances)
All wrong answers: gentle "try again" animation, NO red X or scary sounds
Screen transitions: smooth slide or fade, 300ms max
Character is always visible and reacting somewhere on screen

Audio

All game instructions read aloud via Web Speech API (Hebrew + English)
Positive sound effects on correct answers (stars, chimes, applause)
Gentle neutral sound on wrong answers
Background music: looping K-POP style instrumental (low volume, toggleable)
All audio respects device silent mode

RTL Support

When language is set to Hebrew, the entire UI switches to RTL (dir="rtl")
Use CSS logical properties (margin-inline-start, padding-inline-end) throughout
React Router and all layouts must support RTL flipping

File Structure
src/
├── components/
│   ├── Character/        # Main character, animations, reactions
│   ├── Stage/            # Stage building visualization
│   ├── Games/
│   │   ├── Literacy/
│   │   ├── Math/
│   │   ├── Music/
│   │   ├── Social/
│   │   ├── Nature/
│   │   └── Logic/
│   ├── ParentMode/
│   └── UI/               # Reusable: Button, Card, StarSpark, Modal, etc.
├── hooks/
│   ├── useProgress.ts    # Read/write progress to LocalStorage
│   ├── useProfile.ts     # Active profile management
│   ├── useAudio.ts       # Sound effects + TTS
│   └── useParentMode.ts  # PIN + lock/unlock logic
├── context/
│   └── AppContext.tsx    # Global state: active profile, sparks, language, RTL
├── data/
│   ├── games.ts          # All game content, questions, answers
│   ├── rewards.ts        # Stage items, band members, unlock thresholds
│   └── characters.ts     # Character outfit/accessory data
├── pages/
│   ├── Welcome.tsx       # First launch + name character
│   ├── ProfileSelect.tsx # Choose which sister is playing
│   ├── Home.tsx          # Main hub — room selection + character + stage preview
│   ├── GameRoom.tsx      # Wrapper for each room
│   ├── StageView.tsx     # Full stage/progress view
│   └── ParentMode.tsx    # Parent dashboard
└── utils/
    ├── storage.ts        # LocalStorage helpers
    └── tts.ts            # Web Speech API wrapper
Development Phases
Phase 1 (Build First)

Project setup (React + Vite + TS + Tailwind + Framer Motion + PWA)
AppContext with profile + language + RTL support
LocalStorage hooks (useProgress, useProfile)
Welcome screen (first launch + character naming)
Profile select screen
Home screen (room grid + character display + spark counter)
Star spark earning + animated counter
Stage building visualization (Phase 1 items)

Phase 2

Full Literacy room (4 games, both ages, Hebrew + English)
Full Math room (4 games, both ages)
Parent Mode (PIN, dashboard, settings)

Phase 3

Music, Social, Nature, Logic rooms
Band member unlock system
Concert animation

Phase 4

Full audio (TTS + sound effects)
PWA manifest + install prompt
Deploy to Vercel

Important Constraints

NO backend, NO API calls, NO authentication — 100% client-side
All content must work offline after first load
The app must feel like a native app on iPad/Android tablet
Never show a "game over" or failure state — always redirect to "try again" with encouragement
Every session must end with the child feeling successful

