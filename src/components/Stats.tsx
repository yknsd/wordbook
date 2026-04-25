import type { WordStatus } from '../hooks/useProgress'
import './Stats.css'

interface Props {
  total: number
  progress: Record<number, WordStatus>
  onReset: () => void
  onFilterChange: (filter: 'all' | 'unknown' | 'known') => void
  currentFilter: 'all' | 'unknown' | 'known'
}

export function Stats({ total, progress, onReset, onFilterChange, currentFilter }: Props) {
  const known = Object.values(progress).filter((s) => s === 'known').length
  const unknown = Object.values(progress).filter((s) => s === 'unknown').length
  const unreviewed = total - known - unknown

  return (
    <div className="stats">
      <div className="stat-chips">
        <button
          className={`stat-chip ${currentFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          全て <span className="chip-count">{total}</span>
        </button>
        <button
          className={`stat-chip chip-known ${currentFilter === 'known' ? 'active' : ''}`}
          onClick={() => onFilterChange('known')}
        >
          覚えた <span className="chip-count">{known}</span>
        </button>
        <button
          className={`stat-chip chip-unknown ${currentFilter === 'unknown' ? 'active' : ''}`}
          onClick={() => onFilterChange('unknown')}
        >
          要復習 <span className="chip-count">{unknown}</span>
        </button>
        <span className="stat-chip chip-unreviewed">
          未学習 <span className="chip-count">{unreviewed}</span>
        </span>
      </div>
      <button className="reset-btn" onClick={onReset}>
        リセット
      </button>
    </div>
  )
}
