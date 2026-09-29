import type { LastSetPreview, SetLog } from '../types'
import { estimated1RM } from './format'

export function lastCompletedSets(sets: SetLog[]): SetLog[] {
  return sets
    .filter((s) => s.completed)
    .sort((a, b) => a.setNumber - b.setNumber)
}

export function bestWeight(sets: SetLog[]): number {
  return sets.reduce((m, s) => (s.completed && s.weight > m ? s.weight : m), 0)
}

export function bestSet(sets: SetLog[]): SetLog | undefined {
  return sets
    .filter((s) => s.completed && s.reps > 0)
    .sort((a, b) => {
      const va = estimated1RM(a.weight, a.reps)
      const vb = estimated1RM(b.weight, b.reps)
      if (vb !== va) return vb - va
      if (b.weight !== a.weight) return b.weight - a.weight
      return b.reps - a.reps
    })[0]
}

export function hitTopOfRange(sets: SetLog[], targetSets: number, maxReps: number): boolean {
  const done = lastCompletedSets(sets)
  if (done.length < targetSets) return false
  return done.slice(0, targetSets).every((s) => s.reps >= maxReps)
}

export function toPreview(sets: SetLog[]): LastSetPreview[] {
  return lastCompletedSets(sets).map((s) => ({
    weight: s.weight,
    reps: s.reps,
    completed: true,
  }))
}

export type RangeFilter = '1m' | '3m' | '6m' | '1y' | 'all'

export function rangeStart(filter: RangeFilter): number {
  const now = Date.now()
  if (filter === 'all') return 0
  const days = filter === '1m' ? 30 : filter === '3m' ? 90 : filter === '6m' ? 180 : 365
  return now - days * 86400000
}
