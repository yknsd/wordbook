import { useState, useCallback } from 'react'

export type WordStatus = 'unknown' | 'known' | 'unreviewed'

const STORAGE_KEY = 'wordbook-progress'

function loadProgress(): Record<number, WordStatus> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Record<number, WordStatus>) : {}
  } catch {
    return {}
  }
}

function saveProgress(progress: Record<number, WordStatus>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function useProgress() {
  const [progress, setProgress] = useState<Record<number, WordStatus>>(loadProgress)

  const setStatus = useCallback((wordId: number, status: WordStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [wordId]: status }
      saveProgress(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    setProgress({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { progress, setStatus, resetProgress }
}
