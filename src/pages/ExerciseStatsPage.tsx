import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LineChart } from '../components/LineChart'
import { db } from '../lib/db'
import { estimated1RM, formatKg } from '../lib/format'
import { bestSet, bestWeight, rangeStart, type RangeFilter } from '../lib/stats'

const FILTERS: { id: RangeFilter; label: string }[] = [
  { id: '1m', label: '1 mois' },
  { id: '3m', label: '3 mois' },
  { id: '6m', label: '6 mois' },
  { id: '1y', label: '1 an' },
  { id: 'all', label: 'Tout' },
]

export function ExerciseStatsPage() {
  const { exerciseId } = useParams()
  const [range, setRange] = useState<RangeFilter>('all')
  const exercise = useLiveQuery(() => db.exercises.get(exerciseId!), [exerciseId])
  const sessions = useLiveQuery(() => db.sessions.where('status').equals('completed').toArray()) ?? []
  const sets = useLiveQuery(() => (exerciseId ? db.sets.where('exerciseId').equals(exerciseId).toArray() : []), [exerciseId]) ?? []

  const from = rangeStart(range)
  const sessionMap = new Map(sessions.map((s) => [s.id, s]))
  const filtered = sets.filter((s) => {
    const ses = sessionMap.get(s.sessionId)
    return s.completed && ses && ses.startedAt >= from
  })

  const lastSessionId = [...filtered]
    .map((s) => sessionMap.get(s.sessionId)!)
    .sort((a, b) => b.startedAt - a.startedAt)[0]?.id
  const last = filtered.filter((s) => s.sessionId === lastSessionId).sort((a, b) => a.setNumber - b.setNumber)
  const best = bestSet(filtered)
  const maxW = bestWeight(filtered)
  const sessionCount = new Set(filtered.map((s) => s.sessionId)).size

  const weightPoints = useMemo(() => {
    const bySession = new Map<string, number>()
    for (const s of filtered) {
      const cur = bySession.get(s.sessionId) ?? 0
      bySession.set(s.sessionId, Math.max(cur, s.weight))
    }
    return [...bySession.entries()]
      .map(([sid, y]) => ({ x: sessionMap.get(sid)?.startedAt ?? 0, y }))
      .sort((a, b) => a.x - b.x)
  }, [filtered, sessions])

  const repsPoints = useMemo(() => {
    const bySession = new Map<string, number>()
    for (const s of filtered) {
      const cur = bySession.get(s.sessionId) ?? 0
      bySession.set(s.sessionId, Math.max(cur, s.reps))
    }
    return [...bySession.entries()]
      .map(([sid, y]) => ({ x: sessionMap.get(sid)?.startedAt ?? 0, y }))
      .sort((a, b) => a.x - b.x)
  }, [filtered, sessions])

  if (!exercise) return <div className="page">Chargement…</div>

  return (
    <div className="page">
      <Link className="muted small" to="/progression">
        ← Progression
      </Link>
      <h1 className="title">{exercise.name}</h1>
      <div className="chips" style={{ margin: '12px 0' }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={`chip ${range === f.id ? 'on' : ''}`} onClick={() => setRange(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="muted small">Dernière performance</div>
        <p>
          {last.length
            ? last.map((s) => `${formatKg(s.weight)} × ${s.reps}`).join('  ·  ')
            : 'Pas encore de série'}
        </p>
      </div>
      <div className="card">
        <div className="list-item">
          <span>Meilleur poids</span>
          <strong>{formatKg(maxW)} kg</strong>
        </div>
        <div className="list-item">
          <span>Meilleure série</span>
          <strong>{best ? `${formatKg(best.weight)} × ${best.reps}` : '—'}</strong>
        </div>
        <div className="list-item">
          <span>1RM estimé</span>
          <strong>{best ? `${formatKg(estimated1RM(best.weight, best.reps))} kg` : '—'}</strong>
        </div>
        <div className="list-item">
          <span>Séances</span>
          <strong>{sessionCount}</strong>
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Poids</h3>
        <LineChart points={weightPoints} />
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Répétitions</h3>
        <LineChart points={repsPoints} />
      </div>
    </div>
  )
}
