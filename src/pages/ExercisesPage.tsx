import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { MUSCLE_GROUPS, type MuscleGroup } from '../types'
import { db } from '../lib/db'
import { uid } from '../lib/format'
import { muscleLabel } from '../lib/muscles'

export function ExercisesPage() {
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const [q, setQ] = useState('')
  const [name, setName] = useState('')
  const [group, setGroup] = useState<MuscleGroup>('autre')
  const [variant, setVariant] = useState('')

  const list = exercises
    .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  return (
    <div className="page">
      <h1 className="title">Exercices</h1>
      <input className="search" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>Nouvel exercice</h3>
        <div className="field">
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Groupe</label>
          <select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
            {MUSCLE_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn primary block"
          onClick={async () => {
            if (!name.trim()) return
            await db.exercises.add({
              id: uid('ex'),
              name: name.trim(),
              muscleGroup: group,
              isCustom: true,
              variants: [],
            })
            setName('')
          }}
        >
          Créer
        </button>
      </div>
      {list.map((e) => (
        <div key={e.id} className="card">
          <input
            value={e.name}
            onChange={(ev) => db.exercises.update(e.id, { name: ev.target.value })}
            style={{ background: 'transparent', border: 0, fontSize: 18, fontWeight: 700, width: '100%' }}
          />
          <div className="muted small">{muscleLabel(e.muscleGroup)}</div>
          <select
            value={e.muscleGroup}
            onChange={(ev) => db.exercises.update(e.id, { muscleGroup: ev.target.value as MuscleGroup })}
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          {e.variants.map((v) => (
            <div key={v.id} className="list-item">
              <span>{v.name}</span>
              <button
                className="icon-btn"
                onClick={() =>
                  db.exercises.update(e.id, { variants: e.variants.filter((x) => x.id !== v.id) })
                }
              >
                ✕
              </button>
            </div>
          ))}
          <div className="h-row" style={{ marginTop: 8 }}>
            <input
              className="search"
              placeholder="Nouvelle variante"
              value={variant}
              onChange={(ev) => setVariant(ev.target.value)}
            />
            <button
              className="btn"
              onClick={() => {
                if (!variant.trim()) return
                db.exercises.update(e.id, {
                  variants: [...e.variants, { id: uid('var'), name: variant.trim() }],
                })
                setVariant('')
              }}
            >
              +
            </button>
          </div>
          {e.isCustom && (
            <button className="btn danger" style={{ marginTop: 8 }} onClick={() => db.exercises.delete(e.id)}>
              Supprimer
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
