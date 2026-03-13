// ─── Web Speech API wrapper with Hebrew nikud support ────────────────────────

// Nikud dictionary: bare Hebrew letters/numbers → fully vowelized form for TTS
const NIKUD_MAP: Record<string, string> = {
  // Hebrew letters
  'א': 'אָלֶף',
  'ב': 'בֵּית',
  'ג': 'גִּימֶל',
  'ד': 'דָּלֶת',
  'ה': 'הֵא',
  'ו': 'וָו',
  'ז': 'זַיִן',
  'ח': 'חֵית',
  'ט': 'טֵית',
  'י': 'יוֹד',
  'כ': 'כַּף',
  'ל': 'לָמֶד',
  'מ': 'מֵם',
  'נ': 'נוּן',
  'ס': 'סָמֶך',
  'ע': 'עַיִן',
  'פ': 'פֵּא',
  'צ': 'צָדִי',
  'ק': 'קוֹף',
  'ר': 'רֵישׁ',
  'ש': 'שִׁין',
  'ת': 'תָּו',
  // Hebrew numbers (nikud form for clear pronunciation)
  '1': 'אֶחָד',
  '2': 'שְׁנַיִם',
  '3': 'שָׁלֹשׁ',
  '4': 'אַרְבַּע',
  '5': 'חָמֵשׁ',
  '6': 'שֵׁשׁ',
  '7': 'שֶׁבַע',
  '8': 'שְׁמֹנֶה',
  '9': 'תֵּשַׁע',
  '10': 'עֶשֶׂר',
}

export function speak(text: string, lang: 'he' | 'en' = 'en'): void {
  if (!('speechSynthesis' in window)) return

  // Cancel any current speech
  window.speechSynthesis.cancel()

  // For Hebrew: look up nikud form if available (helps TTS pronounce letters clearly)
  const spokenText = (lang === 'he' && NIKUD_MAP[text]) ? NIKUD_MAP[text] : text

  const utter = new SpeechSynthesisUtterance(spokenText)
  utter.lang = lang === 'he' ? 'he-IL' : 'en-US'
  utter.rate = 0.85  // slower = clearer for kids
  utter.pitch = 1.1  // slightly higher = friendlier
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
