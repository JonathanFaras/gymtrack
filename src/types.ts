export type MuscleGroup =
  | 'pectoraux'
  | 'dos'
  | 'epaules'
  | 'biceps'
  | 'triceps'
  | 'jambes'
  | 'fessiers'
  | 'mollets'
  | 'abdos'
  | 'cardio'
  | 'autre'

export const MUSCLE_GROUPS: { id: MuscleGroup; label: string }[] = [
  { id: 'pectoraux', label: 'Pectoraux' },
  { id: 'dos', label: 'Dos' },
  { id: 'epaules', label: 'Épaules' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'jambes', label: 'Jambes' },
  { id: 'fessiers', label: 'Fessiers' },
  { id: 'mollets', label: 'Mollets' },
  { id: 'abdos', label: 'Abdos' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'autre', label: 'Autre' },
]

export type ExerciseVariant = {
  id: string
  name: string
  referenceWeight?: number
}

export type Exercise = {
  id: string
  name: string
  muscleGroup: MuscleGroup
  isCustom: boolean
  variants: ExerciseVariant[]
}

export type Workout = {
  id: string
  name: string
  description?: string
  warmup?: string
  order: number
  isActiveProgram: boolean
}

export type WorkoutExercise = {
  id: string
  workoutId: string
  exerciseId: string
  variantId?: string
  order: number
  targetSets: number
  minReps: number
  maxReps: number
  referenceWeight?: number
  notes?: string
}

export type WorkoutCardio = {
  id: string
  workoutId: string
  type: string
  durationMin?: number
  speed?: number
  incline?: number
  distanceKm?: number
  notes?: string
}

export type SessionStatus = 'in_progress' | 'completed'

export type WorkoutSession = {
  id: string
  workoutId: string
  startedAt: number
  completedAt?: number
  durationSec?: number
  notes?: string
  status: SessionStatus
}

export type SetLog = {
  id: string
  sessionId: string
  workoutExerciseId: string
  exerciseId: string
  variantId?: string
  setNumber: number
  weight: number
  reps: number
  completed: boolean
  notes?: string
}

export type CardioLog = {
  id: string
  sessionId: string
  type: string
  durationMin?: number
  speed?: number
  incline?: number
  distanceKm?: number
  notes?: string
}

export type Settings = {
  defaultRestSec: number
  weightStep: number
  vibrate: boolean
}

export type MetaRow = {
  key: string
  value: unknown
}

export type LastSetPreview = {
  weight: number
  reps: number
  completed: boolean
}
