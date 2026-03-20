# TODOS — Star Academy

> Items deferred from CEO review (2026-03-20). Ordered by engagement impact.

---

## P1 — Critical Engagement

### TODO-01: Daily Letter / Daily Number mechanic
**What:** Each day, home screen highlights one letter and one number as "today's focus."
The character holds a sign with that letter. Games featuring that letter give 2x sparks.
**Why:** Biggest single engagement unlock — gives kids a reason to come back tomorrow.
Creates parent talking point: "what's today's letter?"
**How:** `(date.getDate() + date.getMonth() * 31) % letters.length` — no backend needed.
Add badge to Home.tsx room cards, add `dailyBonusLetter` to AppContext.
**Effort:** M (2-3 hours)
**Depends on:** nothing

### TODO-02: Welcome-back greeting on Home screen
**What:** When a returning child opens the app, the character shows a 2-second speech bubble:
- First visit today: "Good morning! Ready to practice? 🎤"
- After 2+ days away: "I missed you! Let's make music! 💕"
- After recent band unlock: "Luna joined yesterday! Go see her! 🌟"

**Why:** Makes the app feel alive. Bridges sessions emotionally.
**How:** Read `lastPlayed` from profile (already stored). Compare to today's date.
Add `WelcomeBubble` component to Home.tsx, auto-dismiss after 2.5s.
**Effort:** S (45 min)
**Depends on:** nothing

---

## P2 — Engagement & Polish

### TODO-03: Character teaches back — narrative letter usage
**What:** After each correct answer, the character says the letter in a K-POP sentence.
Example: "Right! Aleph — like in **ABBA**! 🎤" / "נכון! אלף — כמו **אמא**! 💕"
Add 1-2 `characterQuip` strings per letter in `LETTERS_HE` / `LETTERS_EN` data.
**Why:** Reframes the game from "quiz" → "teaching game." Kids who feel like teachers
stay engaged 2-3x longer (based on Duolingo/Khan Kids research).
**How:** Add `characterQuip: string` to `LetterItem`. Show as speech bubble in
`CelebrationOverlay` or as a separate `CharacterSpeech` component in `GameShell`.
TTS reads it aloud (1 second after correct sound).
**Effort:** M (2 hours for code + 1 hour for content writing)
**Depends on:** nothing

### TODO-04: Difficulty curve within a game session
**What:** Rounds 1-3 are easier (more visual hints, bigger choices), rounds 7-10 are harder
(less hints, faster auto-advance). Child should feel they're getting smarter mid-session.
**Why:** Flat difficulty = boredom for fast learners AND frustration for slow learners.
**How:** Pass `roundIdx` to game components. In `LetterRecognition`, reduce hint delay
as rounds increase. In age-5 mode, reduce CelebrationOverlay duration in later rounds.
**Effort:** M (2-3 hours across all games)
**Depends on:** nothing

### TODO-05: Session-end fanfare screen
**What:** After completing a full game AND earning sparks, show a 3-second "session complete"
screen before returning to home. Show total sparks earned, how close to next unlock,
character doing a mini-dance.
**Why:** Right now the game just dumps back to the room list. Kids need a clear "you did it"
moment to feel the session was complete and satisfying.
**How:** Add `SessionComplete` page/modal. `onComplete` in `LiteracyRoom` (and other rooms)
navigates there instead of directly to `/home`.
**Effort:** S (1 hour)
**Depends on:** nothing

---

## P3 — Content & Pedagogy

### TODO-06: Nikud (vowel marks) on displayed Hebrew words
**What:** Show `בַּיִת` instead of `בית`, `כֶּלֶב` instead of `כלב` in all word-facing
game content. Children learning to read Hebrew need vowel marks.
**Why:** Teaching Hebrew reading without nikud is like teaching English reading
without vowels. Kids will be confused when they see real books.
**How:** Add `wordWithNikud: string` to `WordItem` and `LetterItem`. Display it
in game UIs. TTS already uses the correct nikud forms.
**Effort:** L (content writing for all 22+ words × 2 languages)
**Depends on:** nothing
**Note:** Requires a Hebrew education review pass before shipping.

### TODO-07: Phase 3 — Concert animation
**What:** When stage is complete AND all 6 band members unlocked, trigger a full
concert animation. Child's character on stage with all bandmates, music plays,
confetti. Then "Season 2" begins (new goal: world tour).
**Why:** The entire reward arc has no payoff moment. This IS the payoff.
**How:** New `Concert.tsx` page. Triggered from `StageView` when all conditions met.
Full-screen Framer Motion sequence. Then resets to new goal in AppContext.
**Effort:** XL (4-6 hours)
**Depends on:** TODO-08 (Season 2 goal system)

### TODO-08: Season 2 — World Tour goal
**What:** After concert, a new progression goal appears: "World Tour" with new
stage items (tour bus, airport, new city backdrop). New band roles unlock.
**Why:** Without Season 2, a child who completes everything has no reason to play.
**Effort:** XL
**Depends on:** TODO-07

---

## Bugs (fix when encountered)

### BUG-01: `navigate()` called during render
**Where:** `Home.tsx:27-29`, `StageView.tsx:24-26`
```tsx
// ❌ Current
if (!activeProfile) { navigate('/'); return null }
// ✅ Should be
useEffect(() => { if (!activeProfile) navigate('/') }, [activeProfile])
```
**Risk:** React warning in dev, potential flash in some React versions.

### BUG-02: Parent PIN stored as plaintext
**Where:** `storage.ts` — `parentPin` field in localStorage
**Risk:** Low (local app, no server), but any child who opens DevTools can read the PIN.
**Fix:** Store as `btoa(pin)` minimum, or a proper hash if security matters.

### BUG-03: `setTimeout` in Welcome.tsx not cleaned up on unmount
**Where:** `Welcome.tsx:51-55` — `setTimeout(() => navigate('/home'), 2200)`
**Risk:** If component unmounts before 2200ms, state update fires on unmounted component.
**Fix:** Store timeout ref and clear in cleanup.
