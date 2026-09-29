import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import { relativeDay } from '../lib/format'
import { startSession } from '../lib/sessions'
import { bestSet } from '../lib/stats'

export function HomePage() {
  const nav = useNavigate()
  const workouts = useLiveQuery(() => db.workouts.orderBy('order').toArray()) ?? []
  const sessions = useLiveQuery(() => db.sessions.orderBy('startedAt').reverse().toArray()) ?? []
  const sets = useLiveQuery(() => db.sets.toArray()) ?? []
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []

  const active = workouts.filter((w) => w.isActiveProgram)
  const inProgress = sessions.find((s) => s.status === 'in_progress')
  const lastDone = sessions.find((s) => s.status === 'completed')
  const lastWorkout = lastDone ? workouts.find((w) => w.id === lastDone.workoutId) : undefined

  const cycle = ['wo-push', 'wo-pull', 'wo-legs']
  const lastCycle = sessions.find((s) => s.status === 'completed' && cycle.includes(s.workoutId))
  const nextId = lastCycle
    ? cycle[(cycle.indexOf(lastCycle.workoutId) + 1) % cycle.length]
    : 'wo-push'
  const next = workouts.find((w) => w.id === nextId)

  const lastRecord = (() => {
    const completed = sets.filter((s) => s.completed)
    const byEx = new Map<string, typeof completed>()
    for (const s of completed) {
      const arr = byEx.get(s.exerciseId) ?? []
      arr.push(s)
      byEx.set(s.exerciseId, arr)
    }
    let best: { name: string; weight: number; reps: number } | null = null
    for (const [id, arr] of byEx) {
      const b = bestSet(arr)
      if (!b) continue
      if (!best || b.weight > best.weight) {
        const name = exercises.find((e) => e.id === id)?.name ?? 'Exercice'
        best = { name, weight: b.weight, reps: b.reps }
      }
    }
    return best
  })()

  async function go(workoutId: string) {
    const id = await startSession(workoutId)
    nav(`/entrainement/${id}`)
  }

  return (
    <div className="page">
      <p className="muted" style={{ margin: '0 0 4px' }}>
        Bonjour 👋
      </p>
      <h1 className="title">GymTrack</h1>
      <p className="sub">Carnet rapide, prêt pour la salle.</p>

      {inProgress && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="badge">Séance en cours</div>
          <p style={{ margin: '10px 0 14px' }}>
            {workouts.find((w) => w.id === inProgress.workoutId)?.name ?? 'Séance'}
          </p>
          <button className="btn primary block lg" onClick={() => nav(`/entrainement/${inProgress.id}`)}>
            Reprendre
          </button>
        </div>
      )}

      {next && !inProgress && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="badge">Prochaine séance</div>
          <h2 style={{ margin: '10px 0 6px', letterSpacing: '0.08em' }}>{next.name}</h2>
          <p className="muted small">{next.warmup}</p>
          <button className="btn primary block lg" style={{ marginTop: 14 }} onClick={() => go(next.id)}>
            Démarrer
          </button>
        </div>
      )}

      <h2 style={{ margin: '22px 0 10px', fontSize: 16 }}>Tes séances</h2>
      <div className="stack">
        {active.map((w) => (
          <button key={w.id} className={`workout-tile ${w.id === next?.id ? 'active' : ''}`} onClick={() => go(w.id)}>
            <div>
              <h3>{w.name}</h3>
              <p>{w.description}</p>
            </div>
            <span className="badge">Go</span>
          </button>
        ))}
      </div>

      {lastDone && lastWorkout && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="muted small">Dernière séance</div>
          <Link to={`/historique/${lastDone.id}`}>
            <strong>{lastWorkout.name}</strong> — {relativeDay(lastDone.completedAt ?? lastDone.startedAt)}
          </Link>
        </div>
      )}

      {lastRecord && (
        <div className="card">
          <div className="badge gold">Dernier record</div>
          <p style={{ margin: '10px 0 0' }}>
            {lastRecord.name} — {lastRecord.weight} × {lastRecord.reps}
          </p>
          <Link className="muted small" to="/records">
            Voir tous les records
          </Link>
        </div>
      )}
    </div>
  )
}
