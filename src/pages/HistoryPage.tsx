import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../lib/db'
import { formatDate, formatDuration } from '../lib/format'

export function HistoryPage() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().toArray()) ?? []
  const workouts = useLiveQuery(() => db.workouts.toArray()) ?? []
  const done = sessions.filter((s) => s.status === 'completed')

  return (
    <div className="page">
      <h1 className="title">Historique</h1>
      <p className="sub">{done.length} séance{done.length > 1 ? 's' : ''}</p>
      <div className="stack" style={{ marginTop: 16 }}>
        {done.length === 0 && <p className="muted">Aucune séance terminée pour le moment.</p>}
        {done.map((s) => {
          const w = workouts.find((x) => x.id === s.workoutId)
          return (
            <Link key={s.id} className="card" to={`/historique/${s.id}`}>
              <div className="muted small">{formatDate(s.completedAt ?? s.startedAt)}</div>
              <h2 style={{ margin: '6px 0' }}>{w?.name ?? 'Séance'}</h2>
              <div className="muted small">Durée : {formatDuration(s.durationSec ?? 0)}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
