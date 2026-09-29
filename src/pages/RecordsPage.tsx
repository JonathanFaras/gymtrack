import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { estimated1RM, formatKg } from '../lib/format'
import { bestSet, bestWeight } from '../lib/stats'

export function RecordsPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const sets = useLiveQuery(() => db.sets.toArray()) ?? []

  const rows = exercises
    .map((ex) => {
      const group = sets.filter((s) => s.exerciseId === ex.id && s.completed)
      const best = bestSet(group)
      const w = bestWeight(group)
      if (!best) return null
      return {
        ex,
        w,
        combo: `${formatKg(best.weight)} × ${best.reps}`,
        rm: estimated1RM(best.weight, best.reps),
      }
    })
    .filter((x) => x != null)

  return (
    <div className="page">
      <h1 className="title">Records</h1>
      <p className="sub">Détectés automatiquement à chaque série validée.</p>
      <div className="stack" style={{ marginTop: 16 }}>
        {rows.length === 0 && <p className="muted">Pas encore de record. Valide ta première série.</p>}
        {rows.map((r) => (
          <div key={r.ex.id} className="card">
            <h3 style={{ marginTop: 0 }}>{r.ex.name}</h3>
            <div className="list-item">
              <span>Meilleur poids</span>
              <strong>{formatKg(r.w)} kg</strong>
            </div>
            <div className="list-item">
              <span>Meilleure combinaison</span>
              <strong>{r.combo}</strong>
            </div>
            <div className="list-item">
              <span>Meilleur 1RM estimé</span>
              <strong>{formatKg(r.rm)} kg</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
