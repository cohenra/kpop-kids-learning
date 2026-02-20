// ─── Web Speech API wrapper ────────────────────────────────────────────────────

export function speak(text: string, lang: 'he' | 'en' = 'en'): void {
  if (!('speechSynthesis' in window)) return

  // Cancel any current speech
  window.speechSynthesis.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang === 'he' ? 'he-IL' : 'en-US'
  utter.rate = 0.9
  utter.pitch = 1.1
  utter.volume = 1

  window.speechSynthesis.speak(utter)
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function isSpeaking(): boolean {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking
}
