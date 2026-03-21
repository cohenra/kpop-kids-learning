import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { Character } from '../components/Character/Character'
import {
  SONG_QUESTIONS,
  RHYTHM_BPM,
  buildLyrics,
  type BuiltSong,
} from '../data/songStudio'
import { BAND_MEMBERS } from '../data/rewards'
import { speak, stopSpeaking } from '../utils/tts'
import { saveBuiltSong, getBuiltSong } from '../utils/storage'

// ─── SongStudio ───────────────────────────────────────────────────────────────
//
// Phase flow:
//   'questions'  →  5 questions, one at a time, each with 3 choices
//   'player'     →  animated lyric display + beat + TTS + dancing members
//   'done'       →  celebration with replay / home buttons
//
// Beat engine: Web Audio oscillators. startBeat() returns a stop callback.
//
//   questions[0..4]
//      │
//      ▼  (all 5 answered)
//   buildLyrics()  →  BuiltSong  →  saved to localStorage
//      │
//      ▼
//   player: speak line[i], advance after each utterance ends
//      │  beat runs throughout
//      ▼
//   done: +20 ✨, replay / home

type Phase = 'questions' | 'player' | 'done'

interface Answers {
  theme: string
  opening: string
  rhythm: string
  feeling: string
  ending: string
}

// ─── Beat engine ──────────────────────────────────────────────────────────────
let _beatCtx: AudioContext | null = null

function getBeatCtx(): AudioContext {
  if (!_beatCtx || _beatCtx.state === 'closed') {
    _beatCtx = new AudioContext()
  }
  return _beatCtx
}

function beatBeep(freq: number, dur: number, vol = 0.25, type: OscillatorType = 'sine') {
  try {
    const ctx = getBeatCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = type
    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + dur / 1000)
  } catch { /* ignore */ }
}

function startBeat(rhythmId: string): () => void {
  const bpm = RHYTHM_BPM[rhythmId] ?? 110
  const beatMs = (60 / bpm) * 1000
  let running = true
  let beat = 0

  const tick = () => {
    if (!running) return
    const pos = beat % 4
    // Kick on 1 & 3
    if (pos === 0 || pos === 2) beatBeep(90, 90, 0.35)
    // Snare on 2 & 4
    if (pos === 1 || pos === 3) beatBeep(220, 60, 0.15, 'square')
    // Hi-hat every beat
    beatBeep(8000, 15, 0.04, 'square')
    beat++
    setTimeout(tick, beatMs)
  }

  setTimeout(tick, 0)
  return () => { running = false }
}

// ─── Main component ───────────────────────────────────────────────────────────

const SPARK_REWARD = 20

export function SongStudio() {
  const navigate = useNavigate()
  const {
    language, activeProfileId, activeProfile,
    unlockedBandMembers, profileColors, outfit,
    addSparks, backArrow,
  } = useApp()
  const isHe = language === 'he'

  const [phase, setPhase]   = useState<Phase>('questions')
  const [step, setStep]     = useState(0)           // 0-4 during questions
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [song, setSong]     = useState<BuiltSong | null>(null)

  // Player state
  const [lineIdx, setLineIdx]   = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const stopBeatRef  = useRef<(() => void) | null>(null)
  const sparksGivenRef = useRef(false)

  // On mount: check for existing song so returning players can replay
  useEffect(() => {
    const existing = getBuiltSong(activeProfileId)
    if (existing) setSong(existing)
  }, [activeProfileId])

  // Cleanup beat + TTS on unmount
  useEffect(() => {
    return () => {
      stopBeatRef.current?.()
      stopSpeaking()
    }
  }, [])

  // ── Question flow ──────────────────────────────────────────────────────────
  const currentQ = SONG_QUESTIONS[step]

  // Read question aloud on step change
  useEffect(() => {
    if (phase !== 'questions') return
    const q = SONG_QUESTIONS[step]
    if (!q) return
    const text = isHe ? q.ttsHe : q.ttsEn
    setTimeout(() => speak(text, language), 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, phase])

  const handleChoice = (choiceId: string) => {
    const newAnswers = { ...answers, [currentQ.id]: choiceId }
    setAnswers(newAnswers)

    if (step < SONG_QUESTIONS.length - 1) {
      setStep((s) => s + 1)
    } else {
      // All answers collected → build song
      const full = newAnswers as Answers
      const lyricsHe = buildLyrics(full, 'he')
      const lyricsEn = buildLyrics(full, 'en')
      const built: BuiltSong = { ...full, lyricsHe, lyricsEn, createdAt: Date.now() }
      setSong(built)
      saveBuiltSong(activeProfileId, built)
      setPhase('player')
    }
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  const lyrics = song ? (isHe ? song.lyricsHe : song.lyricsEn) : []

  const stopPlayer = useCallback(() => {
    stopBeatRef.current?.()
    stopBeatRef.current = null
    stopSpeaking()
    setIsPlaying(false)
  }, [])

  const startPlayer = useCallback(() => {
    if (!song) return
    setLineIdx(0)
    setIsPlaying(true)
    stopBeatRef.current = startBeat(song.rhythm)
    speakLine(0, song, language, isHe, setLineIdx, setIsPlaying, stopBeatRef)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, language, isHe])

  // Award sparks once when player phase starts
  useEffect(() => {
    if (phase === 'player' && !sparksGivenRef.current) {
      sparksGivenRef.current = true
      addSparks(SPARK_REWARD)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Auto-start player
  useEffect(() => {
    if (phase === 'player' && song && !isPlaying) {
      const t = setTimeout(startPlayer, 600)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, song])

  // Advance to 'done' when last line finishes
  useEffect(() => {
    if (phase === 'player' && lineIdx >= lyrics.length && !isPlaying && lyrics.length > 0) {
      setPhase('done')
    }
  }, [phase, lineIdx, lyrics.length, isPlaying])

  // ── Band members for display ───────────────────────────────────────────────
  const unlockedData = BAND_MEMBERS.filter((m) => unlockedBandMembers.includes(m.id))

  // ── Renders ────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #1E1B2E 0%, #0D0A1E 100%)' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { stopPlayer(); navigate('/home') }}
          className="w-11 h-11 flex items-center justify-center rounded-full
                     bg-white/10 text-white text-xl border border-white/10"
        >
          {backArrow}
        </motion.button>

        <h1
          className="text-white font-bold text-xl"
          style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
        >
          {isHe ? '🎵 סטודיו השירים' : '🎵 Song Studio'}
        </h1>

        {/* Step counter during questions */}
        {phase === 'questions' && (
          <div className="flex gap-1.5">
            {SONG_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: i <= step ? '#EC4899' : 'rgba(255,255,255,0.15)',
                  transform: i === step ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
        {phase !== 'questions' && <div className="w-11" />}
      </div>

      {/* ── PHASE: QUESTIONS ──────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {phase === 'questions' && currentQ && (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, x: isHe ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isHe ? 40 : -40 }}
            className="flex-1 flex flex-col px-4 pb-6 overflow-y-auto"
          >
            {/* Character reacting */}
            <div className="flex justify-center py-3">
              <Character
                mood="thinking"
                size={110}
                hairColor={profileColors.hair}
                outfitColor={profileColors.outfit}
                ribbonColor={profileColors.hair}
                hairAccessory={outfit.hairAccessory}
              />
            </div>

            {/* Question bubble */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 mx-2 px-5 py-3 rounded-2xl text-center"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1.5px solid rgba(124,58,237,0.35)' }}
            >
              <p
                className="text-white font-bold text-lg leading-snug"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isHe ? currentQ.questionHe : currentQ.questionEn}
              </p>
            </motion.div>

            {/* Choices */}
            <div className="flex flex-col gap-3">
              {currentQ.choices.map((choice, ci) => (
                <motion.button
                  key={choice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + ci * 0.08, type: 'spring', stiffness: 200 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(choice.id)}
                  className="w-full py-4 px-5 rounded-2xl flex items-center gap-4
                             border border-white/10 text-start"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,42,74,0.9) 0%, rgba(30,27,46,0.8) 100%)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    minHeight: 72,
                  }}
                  onPointerEnter={() => speak(isHe ? choice.textHe : choice.textEn, language)}
                >
                  <span className="text-4xl flex-shrink-0">{choice.emoji}</span>
                  <span
                    className="text-white font-bold text-lg leading-tight"
                    style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
                  >
                    {isHe ? choice.textHe : choice.textEn}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PHASE: PLAYER ───────────────────────────────────────────────── */}
        {phase === 'player' && song && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center px-4 pb-6 overflow-hidden"
          >
            {/* Stage glow */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(ellipse at 50% 60%, ${profileColors.outfit}55 0%, transparent 60%)`,
              }}
            />

            {/* Dancing band members + character */}
            <div className="relative z-10 flex items-end justify-center gap-1 pt-2 pb-0 w-full">
              {/* Left side members */}
              {unlockedData.filter((_, i) => i % 2 === 1).reverse().map((m, i) => (
                <motion.div
                  key={m.id}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
                >
                  <Character
                    mood="excited"
                    size={58}
                    hairColor={m.hairColor}
                    outfitColor={m.outfitColor}
                  />
                </motion.div>
              ))}

              {/* Main character */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Character
                  mood="excited"
                  size={90}
                  hairColor={profileColors.hair}
                  outfitColor={profileColors.outfit}
                  ribbonColor={profileColors.hair}
                  hairAccessory={outfit.hairAccessory}
                />
              </motion.div>

              {/* Right side members */}
              {unlockedData.filter((_, i) => i % 2 === 0).map((m, i) => (
                <motion.div
                  key={m.id}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                >
                  <Character
                    mood="excited"
                    size={58}
                    hairColor={m.hairColor}
                    outfitColor={m.outfitColor}
                  />
                </motion.div>
              ))}
            </div>

            {/* Lyrics display */}
            <div
              className="relative z-10 flex-1 flex flex-col justify-center items-center gap-2 px-2 w-full"
            >
              {lyrics.map((line, i) => (
                <motion.p
                  key={i}
                  animate={{
                    scale: i === lineIdx - 1 ? [1.08, 1] : 1,
                    opacity: i < lineIdx ? 1 : i === lineIdx ? 0.9 : 0.2,
                    color: i === lineIdx - 1 ? '#F59E0B' : '#ffffff',
                  }}
                  transition={{ duration: 0.4 }}
                  className="text-center font-bold leading-tight"
                  style={{
                    fontFamily: 'Fredoka One, Nunito, sans-serif',
                    fontSize: i === lineIdx - 1 ? '1.25rem' : '1rem',
                    textShadow: i === lineIdx - 1 ? '0 0 20px rgba(245,158,11,0.6)' : 'none',
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Beat indicator */}
            {isPlaying && (
              <motion.div
                className="relative z-10 flex gap-1.5 mb-3"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-1.5 h-5 rounded-full bg-kpop-pink opacity-70" />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── PHASE: DONE ─────────────────────────────────────────────────── */}
        {phase === 'done' && song && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6 gap-5"
          >
            {/* Celebration character */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [-4, 4, -4, 0] }}
              transition={{ duration: 0.7, repeat: 3 }}
            >
              <Character
                mood="excited"
                size={140}
                hairColor={profileColors.hair}
                outfitColor={profileColors.outfit}
                ribbonColor={profileColors.hair}
                hairAccessory={outfit.hairAccessory}
                name={activeProfile?.characterName}
                showName
              />
            </motion.div>

            {/* Well done text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2
                className="text-kpop-gold font-bold text-2xl mb-1"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {isHe ? '🎉 כל הכבוד! השיר שלך מדהים!' : '🎉 Amazing! Your song is incredible!'}
              </h2>
              <div
                className="text-kpop-cyan font-bold text-base"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                +{SPARK_REWARD} ✨
              </div>
            </motion.div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setLineIdx(0)
                  setPhase('player')
                }}
                className="w-full py-4 rounded-2xl font-bold text-white text-xl
                           flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                  boxShadow: '0 0 20px rgba(124,58,237,0.4)',
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                  minHeight: 64,
                }}
              >
                🔁 {isHe ? 'נגן שוב!' : 'Play Again!'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  stopPlayer()
                  setStep(0)
                  setAnswers({})
                  setSong(null)
                  sparksGivenRef.current = false
                  setPhase('questions')
                }}
                className="w-full py-3 rounded-2xl font-bold text-white/70 text-base
                           border border-white/15"
                style={{
                  background: 'rgba(45,42,74,0.7)',
                  fontFamily: 'Fredoka One, Nunito, sans-serif',
                }}
              >
                ✏️ {isHe ? 'שיר חדש' : 'New Song'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => { stopPlayer(); navigate('/home') }}
                className="w-full py-3 rounded-2xl font-bold text-white/50 text-base"
                style={{ fontFamily: 'Fredoka One, Nunito, sans-serif' }}
              >
                {backArrow} {isHe ? 'חזרה הביתה' : 'Back Home'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Lyric-by-lyric TTS speaker ───────────────────────────────────────────────
// Speaks one line at a time. On each utterance end, advances the line index.
// When all lines are done, stops the beat and marks isPlaying=false.

function speakLine(
  idx: number,
  song: BuiltSong,
  language: 'he' | 'en',
  isHe: boolean,
  setLineIdx: (n: number) => void,
  setIsPlaying: (b: boolean) => void,
  stopBeatRef: React.MutableRefObject<(() => void) | null>
) {
  const lyrics = isHe ? song.lyricsHe : song.lyricsEn
  if (idx >= lyrics.length) {
    stopBeatRef.current?.()
    stopBeatRef.current = null
    setIsPlaying(false)
    return
  }

  if (!('speechSynthesis' in window)) {
    // No TTS — advance automatically with a timer
    setLineIdx(idx + 1)
    setTimeout(() => {
      speakLine(idx + 1, song, language, isHe, setLineIdx, setIsPlaying, stopBeatRef)
    }, 1200)
    return
  }

  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(lyrics[idx])
  utter.lang = isHe ? 'he-IL' : 'en-US'
  utter.rate = 0.8
  utter.pitch = 1.15
  utter.volume = 1

  utter.onstart = () => setLineIdx(idx + 1)
  utter.onend = () => {
    setTimeout(() => {
      speakLine(idx + 1, song, language, isHe, setLineIdx, setIsPlaying, stopBeatRef)
    }, 350)  // brief pause between lines
  }
  utter.onerror = () => {
    setTimeout(() => {
      speakLine(idx + 1, song, language, isHe, setLineIdx, setIsPlaying, stopBeatRef)
    }, 800)
  }

  window.speechSynthesis.speak(utter)
}
