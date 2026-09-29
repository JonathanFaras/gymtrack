import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

const tabs = [
  { to: '/', label: 'Accueil', icon: '🏠' },
  { to: '/seances', label: 'Séances', icon: '🏋️' },
  { to: '/historique', label: 'Histo', icon: '📖' },
  { to: '/progression', label: 'Prog.', icon: '📈' },
  { to: '/parametres', label: 'Réglages', icon: '⚙️' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const hideNav = pathname.startsWith('/entrainement')
  return (
    <div className="app">
      {children}
      {!hideNav && (
        <nav className="nav">
          {tabs.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span>{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
