import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/db'
import { formatDate, formatDuration, formatKg } from '../lib/format'

export function HistoryDetailPage() {
  const { id } = useParams()
  const session = useLiveQuery(() => db.sessions.get(id!), [id])
  const workout = useLiveQuery(() => (session ? db.workouts.get(session.workoutId) : undefined), [session?.workoutId])
  const wes =
    useLiveQuery(
      () => (session ? db.workoutExercises.where('workoutId').equals(session.workoutId).toArray() : []),
      [session?.workoutId],
    ) ?? []
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const sets = useLiveQuery(() => (id ? db.sets.where('sessionId').equals(id).toArray() : []), [id]) ?? []
  const cardios = useLiveQuery(() => (id ? db.cardioLogs.where('sessionId').equals(id).toArray() : []), [id]) ?? []

  if (!session || !workout) return <div className="page">Chargement…</div>

  const sorted = [...wes].sort((a, b) => a.order - b.order)

  return (
    <div className="page">
      <Link className="muted small" to="/historique">
        ← Historique
      </Link>
      <h1 className="title">{workout.name}</h1>
      <p className="sub">
        {formatDate(session.completedAt ?? session.startedAt)}
        {session.durationSec != null ? ` · ${formatDuration(session.durationSec)}` : ''}
      </p>
      {session.notes && <div className="card" style={{ marginTop: 12 }}>{session.notes}</div>}
      {sorted.map((we) => {
        const ex = exercises.find((e) => e.id === we.exerciseId)
        const group = sets.filter((s) => s.workoutExerciseId === we.id).sort((a, b) => a.setNumber - b.setNumber)
        const variant = ex?.variants.find((v) => v.id === we.variantId)
        return (
          <div key={we.id} className="card">
            <h3 style={{ marginTop: 0 }}>{ex?.name}</h3>
            {variant && <div className="badge muted">{variant.name}</div>}
            {group.map((s) => (
              <div key={s.id} className="list-item">
                <span className="muted">Série {s.setNumber}</span>
                <strong>
                  {formatKg(s.weight)} × {s.reps}
                  {s.completed ? '' : ' (non validée)'}
                </strong>
              </div>
            ))}
          </div>
        )
      })}
      {cardios.map((c) => (
        <div key={c.id} className="card">
          <div className="badge muted">Cardio</div>
          <h3>
            {c.type} {c.durationMin ? `· ${c.durationMin} min` : ''}
          </h3>
          <p className="muted small">
            {c.speed != null ? `Vitesse ${c.speed}` : ''} {c.incline != null ? `· Inclinaison ${c.incline}` : ''}
          </p>
        </div>
      ))}
    </div>
  )
}
