import { parseNumber } from '../lib/format'

type Props = {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  decimals?: boolean
}

export function NumberStepper({ value, onChange, step = 1, min = 0, decimals }: Props) {
  const inputMode = decimals ? 'decimal' : 'numeric'
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(min, round(value - step, decimals)))}>
        −
      </button>
      <input
        inputMode={inputMode}
        value={Number.isFinite(value) ? String(value) : ''}
        onChange={(e) => onChange(parseNumber(e.target.value))}
      />
      <button type="button" onClick={() => onChange(round(value + step, decimals))}>
        +
      </button>
    </div>
  )
}

function round(n: number, decimals?: boolean) {
  if (!decimals) return Math.round(n)
  return Math.round(n * 10) / 10
}
