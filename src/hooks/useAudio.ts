import { useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { speak, stopSpeaking } from '../utils/tts'

// ─── useAudio: TTS + sound effect helpers ─────────────────────────────────────

interface UseAudioReturn {
  say: (text: string) => void
  stopSpeaking: () => void
  playCorrect: () => void
  playWrong: () => void
  playSpark: () => void
}

// Singleton AudioContext — browsers limit simultaneous contexts (~6 on iOS)
let _audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new AudioContext()
  }
  return _audioCtx
}

// Minimal Web Audio API beep helpers (no external files needed)
function beep(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3
): void {
  try {
    const ctx = getAudioCtx()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration / 1000)
  } catch {
    // Silently ignore if audio context is not available
  }
}

function playCorrectSound() {
  beep(523, 100) // C5
  setTimeout(() => beep(659, 100), 100) // E5
  setTimeout(() => beep(784, 200), 200) // G5
}

function playWrongSound() {
  beep(330, 150, 'sine', 0.2) // gentle low tone
}

function playSparkSound() {
  beep(880, 80)
  setTimeout(() => beep(1047, 80), 80)
  setTimeout(() => beep(1319, 150), 160)
}

export function useAudio(): UseAudioReturn {
  const { language } = useApp()

  const say = useCallback(
    (text: string) => {
      speak(text, language)
    },
    [language]
  )

  const playCorrect = useCallback(() => {
    playCorrectSound()
  }, [])

  const playWrong = useCallback(() => {
    playWrongSound()
  }, [])

  const playSpark = useCallback(() => {
    playSparkSound()
  }, [])

  return { say, stopSpeaking, playCorrect, playWrong, playSpark }
}
