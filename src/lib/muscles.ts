import { MUSCLE_GROUPS, type MuscleGroup } from '../types'

export function muscleLabel(id: MuscleGroup): string {
  return MUSCLE_GROUPS.find((g) => g.id === id)?.label ?? id
}
