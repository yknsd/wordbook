import { useCallback, useEffect, useRef } from 'react'

const FEMALE_VOICE_NAMES = [
  'Samantha',     // macOS Safari
  'Victoria',     // macOS Safari
  'Google US English', // Chrome (female)
  'Karen',        // macOS Australian
  'Moira',        // macOS Irish
]

function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const enVoices = voices.filter((v) => v.lang.startsWith('en'))
  for (const name of FEMALE_VOICE_NAMES) {
    const found = enVoices.find((v) => v.name === name)
    if (found) return found
  }
  // fallback: first en-US voice
  return enVoices.find((v) => v.lang === 'en-US') ?? enVoices[0] ?? null
}

export function useSpeech() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current = pickFemaleVoice(voices)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.82
    utterance.pitch = 1
    if (voiceRef.current) utterance.voice = voiceRef.current
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])

  return { speak, stop }
}
