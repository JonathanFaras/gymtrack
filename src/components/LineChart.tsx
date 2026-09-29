type Point = { x: number; y: number; label?: string }

export function LineChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return <p className="muted small">Pas encore assez de données pour un graphique.</p>
  }
  const w = 360
  const h = 160
  const pad = 18
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  const coords = points.map((p) => {
    const x = pad + ((p.x - minX) / spanX) * (w - pad * 2)
    const y = h - pad - ((p.y - minY) / spanY) * (h - pad * 2)
    return `${x},${y}`
  })
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke="#c8f542"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.join(' ')}
      />
      {points.map((_p, i) => {
        const [x, y] = coords[i].split(',')
        return <circle key={i} cx={x} cy={y} r="4" fill="#c8f542" />
      })}
    </svg>
  )
}
