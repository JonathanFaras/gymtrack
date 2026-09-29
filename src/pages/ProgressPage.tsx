import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../lib/db'
import { formatKg } from '../lib/format'
import { bestSet } from '../lib/stats'

export function ProgressPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const sets = useLiveQuery(() => db.sets.toArray()) ?? []
  const used = exercises
    .map((ex) => {
      const group = sets.filter((s) => s.exerciseId === ex.id && s.completed)
      const last = [...group].sort((a, b) => b.setNumber - a.setNumber)[0]
      const best = bestSet(group)
      return { ex, count: new Set(group.map((s) => s.sessionId)).size, last, best }
    })
    .filter((x) => x.count > 0)

  return (
    <div className="page">
      <div className="h-row">
        <h1 className="title">Progression</h1>
        <Link className="btn" to="/records">
          Records
        </Link>
      </div>
      {used.length === 0 && <p className="muted">Termine une séance pour voir tes courbes.</p>}
      <div className="stack" style={{ marginTop: 16 }}>
        {used.map(({ ex, last, best, count }) => (
          <Link key={ex.id} className="card" to={`/progression/${ex.id}`}>
            <h3 style={{ margin: '0 0 6px' }}>{ex.name}</h3>
            <p className="muted small">
              {count} séance{count > 1 ? 's' : ''}
              {last ? ` · dernier ${formatKg(last.weight)} × ${last.reps}` : ''}
              {best ? ` · record ${formatKg(best.weight)} × ${best.reps}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
