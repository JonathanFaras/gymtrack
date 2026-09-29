import Dexie, { type Table } from 'dexie'
import type {
  CardioLog,
  Exercise,
  MetaRow,
  SetLog,
  Settings,
  Workout,
  WorkoutCardio,
  WorkoutExercise,
  WorkoutSession,
} from '../types'

export class GymDB extends Dexie {
  exercises!: Table<Exercise, string>
  workouts!: Table<Workout, string>
  workoutExercises!: Table<WorkoutExercise, string>
  workoutCardios!: Table<WorkoutCardio, string>
  sessions!: Table<WorkoutSession, string>
  sets!: Table<SetLog, string>
  cardioLogs!: Table<CardioLog, string>
  meta!: Table<MetaRow, string>

  constructor() {
    super('gymtrack')
    this.version(1).stores({
      exercises: 'id, name, muscleGroup',
      workouts: 'id, name, isActiveProgram, order',
      workoutExercises: 'id, workoutId, exerciseId, [workoutId+order]',
      workoutCardios: 'id, workoutId',
      sessions: 'id, workoutId, startedAt, status',
      sets: 'id, sessionId, exerciseId, workoutExerciseId, [sessionId+workoutExerciseId]',
      cardioLogs: 'id, sessionId',
      meta: 'key',
    })
  }
}

export const db = new GymDB()

export const DEFAULT_SETTINGS: Settings = {
  defaultRestSec: 90,
  weightStep: 1,
  vibrate: true,
}

export async function getSettings(): Promise<Settings> {
  const row = await db.meta.get('settings')
  return { ...DEFAULT_SETTINGS, ...(row?.value as Partial<Settings> | undefined) }
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings()
  await db.meta.put({ key: 'settings', value: { ...current, ...patch } })
}
