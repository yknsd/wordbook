import { useState, useMemo } from 'react'
import { words } from './data/words'
import { FlashCard } from './components/FlashCard'
import { Stats } from './components/Stats'
import { useProgress } from './hooks/useProgress'
import './App.css'

type Filter = 'all' | 'unknown' | 'known'

export default function App() {
  const { progress, setStatus, resetProgress } = useProgress()
  const [filter, setFilter] = useState<Filter>('all')
  const [index, setIndex] = useState(0)

  const filteredWords = useMemo(() => {
    if (filter === 'all') return words
    return words.filter((w) => (progress[w.id] ?? 'unreviewed') === filter)
  }, [filter, progress])

  const safeIndex = Math.min(index, Math.max(0, filteredWords.length - 1))
  const currentWord = filteredWords[safeIndex]

  const handleFilterChange = (f: Filter) => {
    setFilter(f)
    setIndex(0)
  }

  const handleKnown = () => {
    if (!currentWord) return
    setStatus(currentWord.id, 'known')
    if (safeIndex < filteredWords.length - 1) setIndex((i) => i + 1)
  }

  const handleUnknown = () => {
    if (!currentWord) return
    setStatus(currentWord.id, 'unknown')
    if (safeIndex < filteredWords.length - 1) setIndex((i) => i + 1)
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
          onReset={() => { resetProgress(); setIndex(0) }}
          onFilterChange={handleFilterChange}
          currentFilter={filter}
        />

        {currentWord ? (
          <FlashCard
            word={currentWord}
            status={progress[currentWord.id] ?? 'unreviewed'}
            onKnown={handleKnown}
            onUnknown={handleUnknown}
            onNext={() => setIndex((i) => Math.min(i + 1, filteredWords.length - 1))}
            onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
            current={safeIndex + 1}
            total={filteredWords.length}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>このフィルターに単語がありません</p>
            <button className="empty-btn" onClick={() => handleFilterChange('all')}>全て表示</button>
          </div>
        )}
      </main>
    </div>
  )
}
