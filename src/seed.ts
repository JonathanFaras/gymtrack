import { db } from './lib/db'
import { uid } from './lib/format'
import type {
  Exercise,
  ExerciseVariant,
  MuscleGroup,
  Workout,
  WorkoutCardio,
  WorkoutExercise,
} from './types'

const SEED_VERSION = 1

function ex(
  id: string,
  name: string,
  muscleGroup: MuscleGroup,
  variants: ExerciseVariant[] = [],
): Exercise {
  return { id, name, muscleGroup, isCustom: false, variants }
}

function we(
  workoutId: string,
  exerciseId: string,
  order: number,
  referenceWeight?: number,
  extra?: Partial<WorkoutExercise>,
): WorkoutExercise {
  return {
    id: uid('we'),
    workoutId,
    exerciseId,
    order,
    targetSets: 3,
    minReps: 8,
    maxReps: 12,
    referenceWeight,
    ...extra,
  }
}

export async function ensureSeed(): Promise<void> {
  const row = await db.meta.get('seedVersion')
  if (row?.value === SEED_VERSION) return
  if (row) return

  const exercises: Exercise[] = [
    ex('ex-bench', 'Développé couché', 'pectoraux'),
    ex('ex-cable-fly', 'Écarté vis-à-vis poulie', 'pectoraux', [
      { id: 'var-fly-low', name: 'Poulie basse', referenceWeight: 18 },
      { id: 'var-fly-high', name: 'Poulie haute', referenceWeight: 18 },
    ]),
    ex('ex-butterfly', 'Butterfly', 'pectoraux'),
    ex('ex-dips', 'Dips', 'pectoraux'),
    ex('ex-triceps-rope', 'Triceps corde', 'triceps', [
      { id: 'var-triceps-arm', name: 'Par bras', referenceWeight: 20.3 },
    ]),
    ex('ex-triceps-ext', 'Extension triceps corde', 'triceps'),
    ex('ex-triceps-low', 'Triceps corde bas', 'triceps'),
    ex('ex-pullups', 'Tractions', 'dos'),
    ex('ex-lat-pulldown', 'Tirage vertical', 'dos'),
    ex('ex-seated-row', 'Tirage horizontal', 'dos'),
    ex('ex-hyper', 'Lombaires', 'dos'),
    ex('ex-incline-curl', 'Curl incliné haltères', 'biceps'),
    ex('ex-preacher', 'Curl pupitre', 'biceps'),
    ex('ex-preacher-n', 'Curl pupitre prise neutre', 'biceps'),
    ex('ex-cable-curl', 'Biceps poulie', 'biceps'),
    ex('ex-hammer', 'Curl marteau poulie', 'biceps', [
      { id: 'var-hammer-203', name: 'Variante 20,3 kg', referenceWeight: 20.3 },
    ]),
    ex('ex-rear-delt', 'Arrière épaule', 'epaules'),
    ex('ex-leg-press', 'Presse à cuisses', 'jambes'),
    ex('ex-hack', 'Hack squat', 'jambes'),
    ex('ex-leg-curl', 'Leg curl', 'jambes'),
    ex('ex-leg-ext', 'Leg extension', 'jambes'),
    ex('ex-abductors', 'Abducteurs', 'fessiers'),
    ex('ex-adductors', 'Adducteurs', 'jambes'),
    ex('ex-calves', 'Mollets', 'mollets'),
    ex('ex-shoulder-press', 'Shoulder press', 'epaules'),
    ex('ex-lateral-cable', 'Élévation latérale poulie', 'epaules'),
    ex('ex-upright-row', 'Rowing menton barre', 'epaules'),
    ex('ex-reverse-fly', 'Butterfly inversé', 'epaules'),
  ]

  const workouts: Workout[] = [
    {
      id: 'wo-push',
      name: 'PUSH',
      description: 'Basic-Fit — poussée',
      warmup: '5 min rameur',
      order: 1,
      isActiveProgram: true,
    },
    {
      id: 'wo-pull',
      name: 'PULL',
      description: 'Basic-Fit — tirage',
      warmup: '5 min rameur',
      order: 2,
      isActiveProgram: true,
    },
    {
      id: 'wo-legs',
      name: 'LEGS',
      description: 'Basic-Fit — jambes',
      warmup: '5 min rameur',
      order: 3,
      isActiveProgram: true,
    },
    {
      id: 'wo-shoulders',
      name: 'ÉPAULES',
      description: 'Ancienne séance (Jour 4) — hors cycle PPL',
      warmup: '5 min rameur',
      order: 10,
      isActiveProgram: false,
    },
  ]

  const workoutExercises: WorkoutExercise[] = [
    we('wo-push', 'ex-bench', 1, 30),
    we('wo-push', 'ex-cable-fly', 2, 18, { variantId: 'var-fly-low' }),
    we('wo-push', 'ex-butterfly', 3, 86),
    we('wo-push', 'ex-dips', 4, 54),
    we('wo-push', 'ex-triceps-rope', 5),
    we('wo-push', 'ex-triceps-ext', 6, 32),
    we('wo-push', 'ex-triceps-low', 7, 23),

    we('wo-pull', 'ex-pullups', 1, 54),
    we('wo-pull', 'ex-lat-pulldown', 2, 52),
    we('wo-pull', 'ex-seated-row', 3, 66),
    we('wo-pull', 'ex-hyper', 4, 15),
    we('wo-pull', 'ex-incline-curl', 5, 12),
    we('wo-pull', 'ex-preacher', 6, 41),
    we('wo-pull', 'ex-preacher-n', 7, 41),
    we('wo-pull', 'ex-cable-curl', 8, 32),
    we('wo-pull', 'ex-hammer', 9, 36),
    we('wo-pull', 'ex-rear-delt', 10, 52),

    we('wo-legs', 'ex-leg-press', 1, 120),
    we('wo-legs', 'ex-hack', 2, 50),
    we('wo-legs', 'ex-leg-curl', 3, 45),
    we('wo-legs', 'ex-leg-ext', 4, 73),
    we('wo-legs', 'ex-abductors', 5, undefined, {
      notes: 'Alterner avec adducteurs',
    }),
    we('wo-legs', 'ex-adductors', 6, undefined, {
      notes: 'Alterner avec abducteurs',
    }),
    we('wo-legs', 'ex-calves', 7, 113),

    we('wo-shoulders', 'ex-shoulder-press', 1, 41),
    we('wo-shoulders', 'ex-lateral-cable', 2, 14),
    we('wo-shoulders', 'ex-upright-row', 3, 13.5),
    we('wo-shoulders', 'ex-reverse-fly', 4, 59),
  ]

  const workoutCardios: WorkoutCardio[] = [
    {
      id: uid('cardio'),
      workoutId: 'wo-shoulders',
      type: 'Marche',
      durationMin: 60,
      incline: 10,
      speed: 5,
    },
  ]

  await db.transaction(
    'rw',
    [
      db.exercises,
      db.workouts,
      db.workoutExercises,
      db.workoutCardios,
      db.meta,
    ],
    async () => {
      await db.exercises.bulkAdd(exercises)
      await db.workouts.bulkAdd(workouts)
      await db.workoutExercises.bulkAdd(workoutExercises)
      await db.workoutCardios.bulkAdd(workoutCardios)
      await db.meta.put({ key: 'seedVersion', value: SEED_VERSION })
    },
  )
}
