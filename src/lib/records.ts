import { db } from '../lib/db'
import { estimated1RM } from './format'
import type { SetLog } from '../types'

export type RecordKind = 'weight' | 'combo' | '1rm'

export async function detectNewRecords(set: SetLog): Promise<RecordKind[]> {
  if (!set.completed || set.reps <= 0) return []
  const all = (await db.sets.where('exerciseId').equals(set.exerciseId).toArray()).filter(
    (s) => s.completed && s.id !== set.id,
  )
  const kinds: RecordKind[] = []
  const maxW = all.reduce((m, s) => Math.max(m, s.weight), 0)
  if (set.weight > maxW) kinds.push('weight')
  const maxCombo = all.reduce((m, s) => Math.max(m, estimated1RM(s.weight, s.reps)), 0)
  const combo = estimated1RM(set.weight, set.reps)
  if (combo > maxCombo) kinds.push('combo')
  if (combo > maxCombo) kinds.push('1rm')
  return [...new Set(kinds)]
}
