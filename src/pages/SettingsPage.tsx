import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db, DEFAULT_SETTINGS, getSettings, saveSettings } from '../lib/db'
import type { Settings } from '../types'

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  useLiveQuery(async () => {
    const s = await getSettings()
    setSettings(s)
    return s
  })

  return (
    <div className="page">
      <h1 className="title">Paramètres</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="field">
          <label>Repos par défaut (s)</label>
          <input
            inputMode="numeric"
            value={settings.defaultRestSec}
            onChange={(e) => {
              const defaultRestSec = Number(e.target.value) || 0
              setSettings({ ...settings, defaultRestSec })
              saveSettings({ defaultRestSec })
            }}
          />
        </div>
        <div className="field">
          <label>Incrément de poids</label>
          <select
            value={settings.weightStep}
            onChange={(e) => {
              const weightStep = Number(e.target.value)
              setSettings({ ...settings, weightStep })
              saveSettings({ weightStep })
            }}
          >
            <option value={0.5}>0,5 kg</option>
            <option value={1}>1 kg</option>
            <option value={2.5}>2,5 kg</option>
          </select>
        </div>
        <label className="muted">
          <input
            type="checkbox"
            checked={settings.vibrate}
            onChange={(e) => {
              const vibrate = e.target.checked
              setSettings({ ...settings, vibrate })
              saveSettings({ vibrate })
            }}
          />{' '}
          Vibration à la fin du repos
        </label>
      </div>
      <div className="card">
        <Link className="btn block" to="/exercices">
          Bibliothèque d’exercices
        </Link>
        <p className="muted small" style={{ marginTop: 12 }}>
          Les données restent sur cet appareil (IndexedDB). Ferme l’app en pleine séance : tu pourras la reprendre.
        </p>
        <button
          className="btn danger block"
          onClick={async () => {
            if (!confirm('Tout supprimer ? Tes performances seront perdues.')) return
            await db.delete()
            location.reload()
          }}
        >
          Réinitialiser les données
        </button>
      </div>
    </div>
  )
}
