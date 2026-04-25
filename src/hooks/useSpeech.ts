import { useCallback, useEffect, useRef } from 'react'

const FEMALE_VOICE_NAMES = [
  'Samantha',          // iOS / macOS Safari
  'Victoria',          // macOS Safari
  'Google US English', // Chrome (female)
  'Karen',             // macOS Australian
  'Moira',             // macOS Irish
]

function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const enVoices = voices.filter((v) => v.lang.startsWith('en'))
  for (const name of FEMALE_VOICE_NAMES) {
    const found = enVoices.find((v) => v.name === name)
    if (found) return found
  }
  return enVoices.find((v) => v.lang === 'en-US') ?? enVoices[0] ?? null
}

export function useSpeech() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  // iOS Safari はユーザー操作なしに音声再生できないため、
  // 初回タップ後からのみ自動再生を許可する
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current = pickFemaleVoice(voices)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)

    const onInteract = () => { hasInteractedRef.current = true }
    window.addEventListener('touchstart', onInteract, { once: true })
    window.addEventListener('mousedown', onInteract, { once: true })

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [])

  const speak = useCallback((text: string, auto = false) => {
    if (!('speechSynthesis' in window)) return
    // auto=true（カード切り替え時）はiOSで操作後のみ再生
    if (auto && !hasInteractedRef.current) return
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
