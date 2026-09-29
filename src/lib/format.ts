export function uid(prefix = ''): string {
  const id = crypto.randomUUID()
  return prefix ? `${prefix}_${id}` : id
}

export function formatKg(n: number | undefined | null): string {
  if (n == null || Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? `${n}` : n.toFixed(1).replace(/\.0$/, '')
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}

export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(ts))
}

export function formatShortDate(ts: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(ts))
}

export function relativeDay(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((start(now) - start(d)) / 86400000)
  if (diff === 0) return "aujourd'hui"
  if (diff === 1) return 'hier'
  if (diff < 7) return `il y a ${diff} j`
  return formatShortDate(ts)
}

export function estimated1RM(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function parseNumber(raw: string): number {
  const n = Number(String(raw).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
