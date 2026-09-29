import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NumberStepper } from '../components/NumberStepper'
import { RestTimer } from '../components/RestTimer'
import { db, getSettings } from '../lib/db'
import { formatDuration, formatKg, uid } from '../lib/format'
import { detectNewRecords } from '../lib/records'
import { completeSession, lastSetsForWorkoutExercise } from '../lib/sessions'
import { hitTopOfRange } from '../lib/stats'
import type { SetLog } from '../types'

export function SessionPage() {
  const { id } = useParams()
  const nav = useNavigate()
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
  const [now, setNow] = useState(Date.now())
  const [open, setOpen] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [suggest, setSuggest] = useState<string | null>(null)
  const [suggestWe, setSuggestWe] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  useEffect(() => {
    getSettings().then((s) => setStep(s.weightStep))
  }, [])

  useEffect(() => {
    if (session?.notes) setNotes(session.notes)
  }, [session?.id])

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const sorted = useMemo(() => [...wes].sort((a, b) => a.order - b.order), [wes])
  useEffect(() => {
    if (!open && sorted[0]) setOpen(sorted[0].id)
  }, [sorted, open])

  if (!session || !workout) {
    return (
      <div className="page session">
        <p className="muted">Chargement…</p>
      </div>
    )
  }

  const current = session
  const elapsed = Math.round((now - current.startedAt) / 1000)

  async function patchSet(row: SetLog, patch: Partial<SetLog>) {
    const next = { ...row, ...patch }
    await db.sets.put(next)
    if (patch.completed === true) {
      const rec = await detectNewRecords(next)
      if (rec.length) {
        const ex = exercises.find((e) => e.id === next.exerciseId)
        setToast(`🏆 Nouveau record — ${ex?.name ?? ''} ${formatKg(next.weight)} kg × ${next.reps}`)
        window.setTimeout(() => setToast(null), 3200)
      }
      const we = wes.find((w) => w.id === next.workoutExerciseId)
      if (we) {
        const group = (await db.sets.where('sessionId').equals(current.id).toArray()).filter(
          (s) => s.workoutExerciseId === we.id,
        )
        if (hitTopOfRange(group, we.targetSets, we.maxReps)) {
          setSuggestWe(we.id)
          setSuggest(`Tu as atteint ${we.maxReps} reps sur les ${we.targetSets} séries.`)
        }
      }
    }
  }

  async function addSet(weId: string, exerciseId: string, variantId?: string) {
    const group = sets.filter((s) => s.workoutExerciseId === weId)
    const last = group.sort((a, b) => b.setNumber - a.setNumber)[0]
    await db.sets.add({
      id: uid('set'),
      sessionId: current.id,
      workoutExerciseId: weId,
      exerciseId,
      variantId,
      setNumber: (last?.setNumber ?? 0) + 1,
      weight: last?.weight ?? 0,
      reps: last?.reps ?? 8,
      completed: false,
    })
  }

  async function finish() {
    await completeSession(current.id, notes)
    nav(`/historique/${current.id}`)
  }

  return (
    <div className="page session">
      {toast && <div className="record-toast">{toast}</div>}
      <div className="h-row">
        <div>
          <div className="muted small">Entraînement</div>
          <h1 className="title" style={{ fontSize: 26 }}>
            {workout.name}
          </h1>
        </div>
        <div className="clock">{formatDuration(elapsed)}</div>
      </div>

      {workout.warmup && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="muted small">Échauffement</div>
          <strong>{workout.warmup}</strong>
        </div>
      )}

      {suggest && (
        <div className="card">
          <p style={{ marginTop: 0 }}>{suggest}</p>
          <p className="muted small">Suggestion seulement — rien n’est modifié tant que tu n’acceptes pas.</p>
          <div className="h-row">
            <button
              className="btn"
              onClick={() => {
                setSuggest(null)
                setSuggestWe(null)
              }}
            >
              Ignorer
            </button>
            <button
              className="btn primary"
              onClick={async () => {
                if (suggestWe) {
                  const we = wes.find((w) => w.id === suggestWe)
                  if (we) {
                    const next = (we.referenceWeight ?? 0) + step
                    await db.workoutExercises.update(we.id, { referenceWeight: next })
                  }
                }
                setSuggest(null)
                setSuggestWe(null)
              }}
            >
              + {step} kg la prochaine fois
            </button>
          </div>
        </div>
      )}

      <div className="stack" style={{ marginTop: 12 }}>
        {sorted.map((we, i) => {
          const ex = exercises.find((e) => e.id === we.exerciseId)
          const group = sets.filter((s) => s.workoutExerciseId === we.id).sort((a, b) => a.setNumber - b.setNumber)
          const done = group.filter((s) => s.completed).length
          const isOpen = open === we.id
          return (
            <div key={we.id} className={`card ex-card ${isOpen ? 'open' : ''}`}>
              <button
                className="h-row"
                style={{ width: '100%', background: 'none', border: 0, textAlign: 'left', padding: 0 }}
                onClick={() => setOpen(isOpen ? null : we.id)}
              >
                <div>
                  <h3>
                    {i + 1}. {ex?.name}
                  </h3>
                  <div className="muted small">
                    Objectif : {we.targetSets} × {we.minReps}-{we.maxReps}
                    {we.referenceWeight != null ? ` · réf. ${formatKg(we.referenceWeight)} kg` : ''}
                  </div>
                </div>
                <span className="badge">
                  {done}/{group.length}
                </span>
              </button>
              {isOpen && (
                <ExerciseBlock
                  weId={we.id}
                  sessionStartedAt={session.startedAt}
                  variantId={we.variantId}
                  variants={ex?.variants ?? []}
                  notes={we.notes}
                  group={group}
                  step={step}
                  onPatch={patchSet}
                  onAdd={() => addSet(we.id, we.exerciseId, we.variantId)}
                  onVariant={(variantId) => db.workoutExercises.update(we.id, { variantId })}
                  onNotes={(n) => db.workoutExercises.update(we.id, { notes: n })}
                />
              )}
            </div>
          )
        })}
      </div>

      {cardios.map((c) => (
        <div key={c.id} className="card">
          <div className="badge muted">Cardio</div>
          <h3 style={{ margin: '8px 0' }}>{c.type}</h3>
          <div className="field">
            <label>Durée (min)</label>
            <input
              inputMode="numeric"
              value={c.durationMin ?? ''}
              onChange={(e) => db.cardioLogs.update(c.id, { durationMin: Number(e.target.value) || undefined })}
            />
          </div>
          <div className="h-row">
            <div className="field" style={{ flex: 1 }}>
              <label>Vitesse</label>
              <input
                inputMode="decimal"
                value={c.speed ?? ''}
                onChange={(e) => db.cardioLogs.update(c.id, { speed: Number(e.target.value.replace(',', '.')) || undefined })}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Inclinaison</label>
              <input
                inputMode="decimal"
                value={c.incline ?? ''}
                onChange={(e) => db.cardioLogs.update(c.id, { incline: Number(e.target.value.replace(',', '.')) || undefined })}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="field" style={{ marginTop: 12 }}>
        <label>Note de séance</label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            void db.sessions.update(session.id, { notes: e.target.value })
          }}
          placeholder="Bonne séance aujourd’hui."
        />
      </div>

      <button className="btn primary block lg" style={{ marginTop: 12 }} onClick={finish}>
        Terminer la séance
      </button>
      <button
        className="btn danger block"
        style={{ marginTop: 8 }}
        onClick={async () => {
          await db.sets.where('sessionId').equals(session.id).delete()
          await db.cardioLogs.where('sessionId').equals(session.id).delete()
          await db.sessions.delete(session.id)
          nav('/')
        }}
      >
        Abandonner
      </button>
      <RestTimer />
    </div>
  )
}

function ExerciseBlock({
  weId,
  sessionStartedAt,
  variantId,
  variants,
  notes,
  group,
  step,
  onPatch,
  onAdd,
  onVariant,
  onNotes,
}: {
  weId: string
  sessionStartedAt: number
  variantId?: string
  variants: { id: string; name: string }[]
  notes?: string
  group: SetLog[]
  step: number
  onPatch: (row: SetLog, patch: Partial<SetLog>) => void
  onAdd: () => void
  onVariant: (id?: string) => void
  onNotes: (n: string) => void
}) {
  const [lastLine, setLastLine] = useState('')
  const we = useLiveQuery(() => db.workoutExercises.get(weId), [weId])

  useEffect(() => {
    if (!we) return
    lastSetsForWorkoutExercise(we, sessionStartedAt).then((rows) => {
      if (!rows.length) {
        setLastLine(we.referenceWeight != null ? `Référence : ${formatKg(we.referenceWeight)} kg` : '')
        return
      }
      const first = rows[0]
      setLastLine(
        `Dernière fois : ${formatKg(first.weight)} kg × ${first.reps}` +
          (rows.length > 1 ? `  ·  ${rows.map((r) => `${formatKg(r.weight)}×${r.reps}`).join('  ')}` : ''),
      )
    })
  }, [we, sessionStartedAt])

  return (
    <div style={{ marginTop: 12 }}>
      {lastLine && <div className="last">{lastLine}</div>}
      {variants.length > 0 && (
        <div className="chips" style={{ marginTop: 10 }}>
          {variants.map((v) => (
            <button key={v.id} className={`chip ${variantId === v.id ? 'on' : ''}`} onClick={() => onVariant(v.id)}>
              {v.name}
            </button>
          ))}
        </div>
      )}
      {group.map((s) => (
        <div key={s.id} className="set-row">
          <div className="set-n">{s.setNumber}</div>
          <NumberStepper value={s.weight} onChange={(n) => onPatch(s, { weight: n })} step={step} decimals />
          <NumberStepper value={s.reps} onChange={(n) => onPatch(s, { reps: n })} step={1} />
          <button className={`check ${s.completed ? 'on' : ''}`} onClick={() => onPatch(s, { completed: !s.completed })}>
            {s.completed ? '✓' : ''}
          </button>
        </div>
      ))}
      <button className="btn block" style={{ marginTop: 12 }} onClick={onAdd}>
        + Ajouter une série
      </button>
      <div className="field" style={{ marginTop: 10 }}>
        <label>Note exercice</label>
        <input value={notes ?? ''} onChange={(e) => onNotes(e.target.value)} placeholder="Amplitude, sensation…" />
      </div>
    </div>
  )
}
