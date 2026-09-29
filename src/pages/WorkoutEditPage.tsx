import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../lib/db'
import { uid } from '../lib/format'
import type { Workout, WorkoutCardio, WorkoutExercise } from '../types'

export function WorkoutEditPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const isNew = !id || id === 'nouvelle'
  const workout = useLiveQuery(() => (isNew ? undefined : db.workouts.get(id!)), [id])
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const wes = useLiveQuery(
    () => (isNew ? [] : db.workoutExercises.where('workoutId').equals(id!).toArray()),
    [id],
  ) ?? []
  const cardios =
    useLiveQuery(() => (isNew ? [] : db.workoutCardios.where('workoutId').equals(id!).toArray()), [id]) ?? []

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [warmup, setWarmup] = useState('5 min rameur')
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (workout) {
      setName(workout.name)
      setDescription(workout.description ?? '')
      setWarmup(workout.warmup ?? '')
      setActive(workout.isActiveProgram)
    }
  }, [workout])

  async function saveHeader() {
    const payload: Workout = {
      id: isNew ? uid('wo') : id!,
      name: name || 'Nouvelle séance',
      description: description || undefined,
      warmup: warmup || undefined,
      order: workout?.order ?? Date.now(),
      isActiveProgram: active,
    }
    if (isNew) {
      await db.workouts.add(payload)
      nav(`/seances/${payload.id}`, { replace: true })
    } else {
      await db.workouts.put(payload)
    }
  }

  async function addExercise(exerciseId: string) {
    if (isNew) await saveHeader()
    const wid = isNew ? undefined : id
    const realId = wid ?? (await db.workouts.orderBy('order').last())?.id
    if (!realId) return
    const order = (wes.reduce((m, x) => Math.max(m, x.order), 0) || 0) + 1
    const row: WorkoutExercise = {
      id: uid('we'),
      workoutId: realId,
      exerciseId,
      order,
      targetSets: 3,
      minReps: 8,
      maxReps: 12,
    }
    await db.workoutExercises.add(row)
  }

  async function addCardio() {
    if (!id || isNew) return
    const row: WorkoutCardio = { id: uid('cardio'), workoutId: id, type: 'Marche', durationMin: 20 }
    await db.workoutCardios.add(row)
  }

  const sorted = [...wes].sort((a, b) => a.order - b.order)

  return (
    <div className="page">
      <h1 className="title">{isNew ? 'Nouvelle séance' : name}</h1>
      <div className="stack" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label>Échauffement</label>
          <input value={warmup} onChange={(e) => setWarmup(e.target.value)} />
        </div>
        <label className="muted small">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Cycle PPL /
          accueil
        </label>
        <button className="btn primary" onClick={saveHeader}>
          Enregistrer
        </button>
      </div>

      {!isNew && (
        <>
          <h2 style={{ marginTop: 24 }}>Exercices</h2>
          {sorted.map((we, i) => {
            const ex = exercises.find((e) => e.id === we.exerciseId)
            return (
              <div key={we.id} className="card">
                <div className="h-row">
                  <strong>
                    {i + 1}. {ex?.name}
                  </strong>
                  <button
                    className="icon-btn"
                    onClick={() => db.workoutExercises.delete(we.id)}
                  >
                    ✕
                  </button>
                </div>
                {ex && ex.variants.length > 0 && (
                  <div className="field" style={{ marginTop: 8 }}>
                    <label>Variante</label>
                    <select
                      value={we.variantId ?? ''}
                      onChange={(e) =>
                        db.workoutExercises.update(we.id, { variantId: e.target.value || undefined })
                      }
                    >
                      <option value="">Aucune</option>
                      {ex.variants.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="h-row" style={{ marginTop: 8 }}>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Séries</label>
                    <input
                      inputMode="numeric"
                      value={we.targetSets}
                      onChange={(e) => db.workoutExercises.update(we.id, { targetSets: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Reps min</label>
                    <input
                      inputMode="numeric"
                      value={we.minReps}
                      onChange={(e) => db.workoutExercises.update(we.id, { minReps: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="field" style={{ flex: 1 }}>
                    <label>Reps max</label>
                    <input
                      inputMode="numeric"
                      value={we.maxReps}
                      onChange={(e) => db.workoutExercises.update(we.id, { maxReps: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 8 }}>
                  <label>Charge de référence (kg)</label>
                  <input
                    inputMode="decimal"
                    value={we.referenceWeight ?? ''}
                    onChange={(e) =>
                      db.workoutExercises.update(we.id, {
                        referenceWeight: e.target.value === '' ? undefined : Number(e.target.value.replace(',', '.')),
                      })
                    }
                  />
                </div>
                <div className="field">
                  <label>Notes</label>
                  <input
                    value={we.notes ?? ''}
                    onChange={(e) => db.workoutExercises.update(we.id, { notes: e.target.value })}
                  />
                </div>
                <div className="h-row">
                  <button
                    className="btn"
                    disabled={i === 0}
                    onClick={async () => {
                      const prev = sorted[i - 1]
                      await db.workoutExercises.update(we.id, { order: prev.order })
                      await db.workoutExercises.update(prev.id, { order: we.order })
                    }}
                  >
                    ↑
                  </button>
                  <button
                    className="btn"
                    disabled={i === sorted.length - 1}
                    onClick={async () => {
                      const next = sorted[i + 1]
                      await db.workoutExercises.update(we.id, { order: next.order })
                      await db.workoutExercises.update(next.id, { order: we.order })
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            )
          })}

          <h3>Ajouter un exercice</h3>
          <ExercisePicker onPick={addExercise} />
          <Link className="btn block" to="/exercices">
            Bibliothèque d’exercices
          </Link>

          <h2 style={{ marginTop: 24 }}>Cardio</h2>
          {cardios.map((c) => (
            <div key={c.id} className="card">
              <div className="field">
                <label>Type</label>
                <input value={c.type} onChange={(e) => db.workoutCardios.update(c.id, { type: e.target.value })} />
              </div>
              <div className="h-row">
                <div className="field" style={{ flex: 1 }}>
                  <label>Durée (min)</label>
                  <input
                    inputMode="numeric"
                    value={c.durationMin ?? ''}
                    onChange={(e) => db.workoutCardios.update(c.id, { durationMin: Number(e.target.value) || undefined })}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Vitesse</label>
                  <input
                    inputMode="decimal"
                    value={c.speed ?? ''}
                    onChange={(e) => db.workoutCardios.update(c.id, { speed: Number(e.target.value.replace(',', '.')) || undefined })}
                  />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Inclinaison</label>
                  <input
                    inputMode="decimal"
                    value={c.incline ?? ''}
                    onChange={(e) => db.workoutCardios.update(c.id, { incline: Number(e.target.value.replace(',', '.')) || undefined })}
                  />
                </div>
              </div>
              <button className="btn danger" onClick={() => db.workoutCardios.delete(c.id)}>
                Supprimer
              </button>
            </div>
          ))}
          <button className="btn block" onClick={addCardio}>
            + Cardio
          </button>
        </>
      )}
    </div>
  )
}

function ExercisePicker({ onPick }: { onPick: (id: string) => void }) {
  const [q, setQ] = useState('')
  const exercises = useLiveQuery(() => db.exercises.toArray()) ?? []
  const list = exercises.filter((e) => e.name.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="card">
      <input className="search" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.slice(0, 8).map((e) => (
        <button key={e.id} className="list-item" style={{ width: '100%', background: 'none', border: 0, textAlign: 'left' }} onClick={() => onPick(e.id)}>
          <span>{e.name}</span>
          <span className="badge muted">Ajouter</span>
        </button>
      ))}
    </div>
  )
}
