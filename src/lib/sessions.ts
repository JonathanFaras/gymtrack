import { db } from './db'
import { uid } from './format'
import type { LastSetPreview, SetLog, WorkoutExercise, WorkoutSession } from './types'

export async function lastSetsForExercise(
  exerciseId: string,
  variantId?: string,
  before?: number,
): Promise<SetLog[]> {
  const sessions = await db.sessions
    .where('status')
    .equals('completed')
    .toArray()
  const sorted = sessions
    .filter((s) => (before ? s.startedAt < before : true))
    .sort((a, b) => b.startedAt - a.startedAt)

  for (const session of sorted) {
    const sets = await db.sets.where('sessionId').equals(session.id).toArray()
    const match = sets
      .filter((s) => s.exerciseId === exerciseId)
      .filter((s) => (variantId ? s.variantId === variantId : true))
      .filter((s) => s.completed)
      .sort((a, b) => a.setNumber - b.setNumber)
    if (match.length) return match
  }
  return []
}

export async function lastSetsForWorkoutExercise(
  we: WorkoutExercise,
  before?: number,
): Promise<SetLog[]> {
  const sessions = await db.sessions
    .where('status')
    .equals('completed')
    .toArray()
  const sorted = sessions
    .filter((s) => (before ? s.startedAt < before : true))
    .sort((a, b) => b.startedAt - a.startedAt)

  for (const session of sorted) {
    const sets = await db.sets.where('sessionId').equals(session.id).toArray()
    const bySlot = sets
      .filter((s) => s.workoutExerciseId === we.id && s.completed)
      .sort((a, b) => a.setNumber - b.setNumber)
    if (bySlot.length) return bySlot

    const byEx = sets
      .filter((s) => s.exerciseId === we.exerciseId)
      .filter((s) => (we.variantId ? s.variantId === we.variantId : true))
      .filter((s) => s.completed)
      .sort((a, b) => a.setNumber - b.setNumber)
    if (byEx.length) return byEx
  }
  return []
}

export function seedSetsFromLast(
  sessionId: string,
  we: WorkoutExercise,
  last: SetLog[],
): SetLog[] {
  const count = Math.max(we.targetSets, last.length || we.targetSets)
  const rows: SetLog[] = []
  for (let i = 1; i <= count; i++) {
    const prev = last.find((s) => s.setNumber === i) ?? last[i - 1]
    const weight =
      prev?.weight ??
      we.referenceWeight ??
      0
    const reps = prev?.reps ?? we.minReps
    rows.push({
      id: uid('set'),
      sessionId,
      workoutExerciseId: we.id,
      exerciseId: we.exerciseId,
      variantId: we.variantId ?? prev?.variantId,
      setNumber: i,
      weight,
      reps,
      completed: false,
    })
  }
  return rows
}

export function previewFromSets(sets: SetLog[]): LastSetPreview[] {
  return [...sets]
    .filter((s) => s.completed)
    .sort((a, b) => a.setNumber - b.setNumber)
    .map((s) => ({ weight: s.weight, reps: s.reps, completed: true }))
}

export async function startSession(workoutId: string): Promise<string> {
  const existing = await db.sessions.where('status').equals('in_progress').first()
  if (existing) return existing.id

  const session: WorkoutSession = {
    id: uid('ses'),
    workoutId,
    startedAt: Date.now(),
    status: 'in_progress',
  }

  const wes = (await db.workoutExercises.where('workoutId').equals(workoutId).toArray()).sort(
    (a, b) => a.order - b.order,
  )
  const cardios = await db.workoutCardios.where('workoutId').equals(workoutId).toArray()

  const allSets: SetLog[] = []
  for (const we of wes) {
    const last = await lastSetsForWorkoutExercise(we)
    allSets.push(...seedSetsFromLast(session.id, we, last))
  }

  await db.transaction('rw', [db.sessions, db.sets, db.cardioLogs], async () => {
    await db.sessions.add(session)
    if (allSets.length) await db.sets.bulkAdd(allSets)
    for (const c of cardios) {
      await db.cardioLogs.add({
        id: uid('clog'),
        sessionId: session.id,
        type: c.type,
        durationMin: c.durationMin,
        speed: c.speed,
        incline: c.incline,
        distanceKm: c.distanceKm,
        notes: c.notes,
      })
    }
  })

  return session.id
}

export async function completeSession(sessionId: string, notes?: string): Promise<void> {
  const session = await db.sessions.get(sessionId)
  if (!session) return
  const now = Date.now()
  await db.sessions.update(sessionId, {
    status: 'completed',
    completedAt: now,
    durationSec: Math.round((now - session.startedAt) / 1000),
    notes: notes ?? session.notes,
  })
}
