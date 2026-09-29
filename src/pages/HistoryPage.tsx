
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../lib/db'
import { formatDate, formatDuration } from '../lib/format'

export function HistoryPage() {
  const sessions =
    useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().toArray()) ?? []

  const workouts = useLiveQuery(() => db.workouts.toArray()) ?? []

  const done = sessions.filter((s) => s.status === 'completed')

  async function deleteSession(id: string) {
    const confirmed = window.confirm(
      'Supprimer cette séance de l’historique ? Cette action est irréversible.',
    )

    if (!confirmed) return

    await db.sessions.delete(id)
  }

  async function resetHistory() {
    const confirmed = window.confirm(
      `Supprimer les ${done.length} séances de l’historique ? Cette action est irréversible.`,
    )

    if (!confirmed) return

    await db.sessions
      .filter((session) => session.status === 'completed')
      .delete()
  }

  return (
    <div className="page">
      <div className="h-row">
        <div>
          <h1 className="title">Historique</h1>
          <p className="sub">
            {done.length} séance{done.length > 1 ? 's' : ''}
          </p>
        </div>

        {done.length > 0 && (
          <button
            type="button"
            className="btn danger"
            onClick={resetHistory}
          >
            Reset
          </button>
        )}
      </div>

      <div className="stack" style={{ marginTop: 16 }}>
        {done.length === 0 && (
          <p className="muted">Aucune séance terminée pour le moment.</p>
        )}

        {done.map((s) => {
          const w = workouts.find((x) => x.id === s.workoutId)

          return (
            <div key={s.id} className="card">
              <Link
                to={`/historique/${s.id}`}
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <div className="muted small">
                  {formatDate(s.completedAt ?? s.startedAt)}
                </div>

                <h2 style={{ margin: '6px 0' }}>
                  {w?.name ?? 'Séance'}
                </h2>

                <div className="muted small">
                  Durée : {formatDuration(s.durationSec ?? 0)}
                </div>
              </Link>

              <button
                type="button"
                className="btn danger"
                style={{
                  width: '100%',
                  marginTop: 12,
                }}
                onClick={() => deleteSession(s.id)}
              >
                Supprimer cette séance
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
