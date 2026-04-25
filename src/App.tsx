import { useState } from 'react'
import { words } from './data/words'
import type { Word } from './data/words'
import { FlashCard } from './components/FlashCard'
import { Stats } from './components/Stats'
import { useProgress } from './hooks/useProgress'
import './App.css'

type Filter = 'all' | 'unknown' | 'known'

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j] as T, result[i] as T]
  }
  return result
}

export default function App() {
  const { progress, setStatus, resetProgress } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const [index, setIndex] = useState(0)
  const [deck, setDeck] = useState<Word[]>(() => shuffle(words))

  const safeIndex = Math.min(index, Math.max(0, deck.length - 1))
  const currentWord = deck[safeIndex]

  // フィルターが変わるたびにシャッフルし直す
  // filteredWords は useMemo だと filter 変更前の値を参照するため、直接計算する
  const handleFilterChange = (f: Filter) => {
    const filtered =
      f === 'all' ? words : words.filter((w) => (progress[w.id] ?? 'unreviewed') === f)
    setFilter(f)
    setDeck(shuffle(filtered))
    setIndex(0)
  }

  const handleKnown = () => {
    if (!currentWord) return
    setStatus(currentWord.id, 'known')
    if (safeIndex < deck.length - 1) setIndex((i) => i + 1)
  }

  const handleUnknown = () => {
    if (!currentWord) return
    setStatus(currentWord.id, 'unknown')
    if (safeIndex < deck.length - 1) setIndex((i) => i + 1)
  }

  const handleReset = () => {
    resetProgress()
    setDeck(shuffle(words))
    setIndex(0)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">wordbook</h1>
      </header>

      <main className="app-main">
        <Stats
          total={words.length}
          progress={progress}
          onReset={handleReset}
          onFilterChange={handleFilterChange}
          currentFilter={filter}
        />

        {currentWord ? (
          <FlashCard
            word={currentWord}
            status={progress[currentWord.id] ?? 'unreviewed'}
            onKnown={handleKnown}
            onUnknown={handleUnknown}
            current={safeIndex + 1}
            total={deck.length}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>このフィルターに単語がありません</p>
            <button className="empty-btn" onClick={() => handleFilterChange('all')}>
              全て表示
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
