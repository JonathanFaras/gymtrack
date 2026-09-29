import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '../lib/format'
import { getSettings } from '../lib/db'

const PRESETS = [60, 90, 120, 180]

export function RestTimer() {
  const [total, setTotal] = useState(90)
  const [left, setLeft] = useState<number | null>(null)
  const [runId, setRunId] = useState(0)
  const [custom, setCustom] = useState('')
  const done = left === 0
  const tick = useRef<number | null>(null)

  useEffect(() => {
    getSettings().then((s) => setTotal(s.defaultRestSec))
  }, [])

  useEffect(() => {
    if (runId === 0) return
    tick.current = window.setInterval(() => {
      setLeft((v) => (v == null || v <= 0 ? v : v - 1))
    }, 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [runId])

  useEffect(() => {
    if (left !== 0) return
    getSettings().then((s) => {
      if (s.vibrate && navigator.vibrate) navigator.vibrate([200, 80, 200, 80, 400])
    })
  }, [left])

  function start(sec: number) {
    setTotal(sec)
    setLeft(sec)
    setRunId((n) => n + 1)
  }

  return (
    <div className="timer-bar">
      <div className="h-row">
        <strong>Repos</strong>
        <span className={`clock ${done ? 'timer-done' : ''}`} style={{ fontSize: 22, borderRadius: 12, padding: '2px 8px' }}>
          {left == null ? formatDuration(total) : formatDuration(left)}
        </span>
        {left != null && (
          <button className="btn" style={{ minHeight: 40 }} onClick={() => setLeft(null)}>
            Stop
          </button>
        )}
      </div>
      <div className="timer-grid">
        {PRESETS.map((s) => (
          <button key={s} className="btn" onClick={() => start(s)}>
            {s}s
          </button>
        ))}
      </div>
      <div className="h-row" style={{ marginTop: 8 }}>
        <input
          className="search"
          inputMode="numeric"
          placeholder="Perso (s)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          className="btn primary"
          onClick={() => {
            const n = Number(custom)
            if (n > 0) start(n)
          }}
        >
          Go
        </button>
      </div>
    </div>
  )
}
