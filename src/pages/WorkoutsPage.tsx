import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import { startSession } from '../lib/sessions'

export function WorkoutsPage() {
  const nav = useNavigate()
  const workouts = useLiveQuery(() => db.workouts.orderBy('order').toArray()) ?? []

  return (
    <div className="page">
      <div className="h-row">
        <h1 className="title">Séances</h1>
        <Link className="btn primary" to="/seances/nouvelle">
          +
        </Link>
      </div>
      <p className="sub">Programme actuel et anciennes séances.</p>
      <div className="stack" style={{ marginTop: 16 }}>
        {workouts.map((w) => (
          <div key={w.id} className="card">
            <div className="h-row">
              <div>
                <div className="badge">{w.isActiveProgram ? 'PPL' : 'Perso'}</div>
                <h2 style={{ margin: '8px 0 4px', letterSpacing: '0.06em' }}>{w.name}</h2>
                <p className="muted small">{w.description}</p>
              </div>
            </div>
            <div className="h-row" style={{ marginTop: 12 }}>
              <button
                className="btn primary"
                onClick={async () => nav(`/entrainement/${await startSession(w.id)}`)}
              >
                Démarrer
              </button>
              <Link className="btn" to={`/seances/${w.id}`}>
                Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
