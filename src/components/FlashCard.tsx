import { useState, useEffect } from 'react'
import type { Word } from '../data/words'
import type { WordStatus } from '../hooks/useProgress'
import { useSpeech } from '../hooks/useSpeech'
import './FlashCard.css'

interface Props {
  word: Word
  status: WordStatus
  onKnown: () => void
  onUnknown: () => void
  onNext: () => void
  onPrev: () => void
  current: number
  total: number
}

function highlightWord(sentence: string, target: string) {
  const regex = new RegExp(`(${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = sentence.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="word-highlight">{part}</mark> : part
  )
}

export function FlashCard({ word, status, onKnown, onUnknown, onNext, onPrev, current, total }: Props) {
  const [flipped, setFlipped] = useState(false)
  const { speak } = useSpeech()

  useEffect(() => {
    setFlipped(false)
    const timer = setTimeout(() => speak(word.word), 150)
    return () => clearTimeout(timer)
  }, [word.id, speak, word.word])

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    speak(word.word)
  }

  const levelLabel: Record<Word['level'], string> = {
    essential: '基礎',
    intermediate: '中級',
    advanced: '上級',
  }

  return (
    <div className="flashcard-container">
      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${(current / total) * 100}%` }} />
      </div>
      <div className="progress-text">{current} / {total}</div>

      <div className={`card-scene ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
        <div className="card">
          <div className="card-face card-front">
            <span className={`level-badge level-${word.level}`}>{levelLabel[word.level]}</span>

            <div className="word-text">{word.word}</div>
            <div className="phonetic">{word.phonetic}</div>

            <button className="speak-btn speak-btn-center" onClick={handleSpeak} title="発音を聞く">🔊</button>

            <div className="front-divider" />

            <div className="front-example">
              <p className="front-example-en">{highlightWord(word.example, word.word)}</p>
              <p className="front-example-ja">{word.exampleTranslation}</p>
            </div>

            <div className="tap-hint">タップして意味を見る</div>
          </div>

          <div className="card-face card-back">
            <button className="speak-btn speak-btn-back" onClick={handleSpeak} title="発音を聞く">🔊</button>
            <div className="part-of-speech">{word.partOfSpeech}</div>
            <div className="meaning">{word.meaning}</div>
            <div className="example-section">
              <div className="example">"{highlightWord(word.example, word.word)}"</div>
              <div className="example-translation">{word.exampleTranslation}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-btn unknown-btn" onClick={onUnknown}>
          <span className="btn-icon">✗</span>
          <span className="btn-label">わからない</span>
        </button>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={onPrev} disabled={current <= 1}>‹</button>
          <button className="nav-btn" onClick={onNext} disabled={current >= total}>›</button>
        </div>
        <button className="action-btn known-btn" onClick={onKnown}>
          <span className="btn-icon">✓</span>
          <span className="btn-label">わかった！</span>
        </button>
      </div>

      {status !== 'unreviewed' && (
        <div className={`status-indicator ${status}`}>
          {status === 'known' ? '✓ 覚えた' : '✗ 要復習'}
        </div>
      )}
    </div>
  )
}
