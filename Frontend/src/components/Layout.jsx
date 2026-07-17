import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/',          label: 'Home',              icon: '⌂',  end: true },
  { to: '/courses',   label: 'Catalog',           icon: '◈' },
]

const AUTH_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',         icon: '◉' },
]

const ADMIN_ITEMS = [
  { to: '/admin',     label: 'Admin',             icon: '⚙' },
]

const INST_ITEMS = [
  { to: '/studio',    label: 'Studio',            icon: '✦' },
]

function NavItems({ onNavigate, isAuthenticated, isInstructor, isAdmin, credentials }) {
  const cls = ({ isActive }) => (isActive ? 'sb-link is-active' : 'sb-link')
  return (
    <>
      <span className="sb-section-label">Explore</span>
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <NavLink key={to} to={to} className={cls} end={end} onClick={onNavigate}>
          <span className="sb-ico" aria-hidden>{icon}</span>
          {label}
        </NavLink>
      ))}

      {isAuthenticated && (
        <>
          <span className="sb-section-label">My Space</span>
          {AUTH_ITEMS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={cls} onClick={onNavigate}>
              <span className="sb-ico" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
          {isInstructor && INST_ITEMS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={cls} onClick={onNavigate}>
              <span className="sb-ico" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
          {isAdmin && ADMIN_ITEMS.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={cls} onClick={onNavigate}>
              <span className="sb-ico" aria-hidden>{icon}</span>
              {label}
            </NavLink>
          ))}
        </>
      )}
    </>
  )
}

const THEME_META = {
  system: { icon: '◐', label: 'System', next: 'light' },
  light:  { icon: '☀', label: 'Light',  next: 'dark'  },
  dark:   { icon: '●', label: 'Dark',   next: 'system'},
}

export default function Layout({ children }) {
  const { isAuthenticated, isInstructor, isAdmin, logout, credentials } = useAuth()
  const { preference, cycleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  const themeMeta = THEME_META[preference] || THEME_META.system

  const initials = credentials?.username
    ? credentials.username.slice(0, 2).toUpperCase()
    : '?'

  const roleLabel = credentials?.roles?.includes('ADMIN')
    ? 'Admin'
    : credentials?.roles?.includes('INSTRUCTOR')
      ? 'Instructor'
      : 'Learner'

  return (
    <div className="app-shell">
      {/* ── Mobile hamburger ── */}
      <button
        type="button"
        className="mobile-menu-btn"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(o => !o)}
      >
        <span className="burger" data-open={menuOpen} />
      </button>

      {menuOpen && (
        <button type="button" className="sidebar-scrim" aria-label="Close menu" onClick={closeMenu} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <Link to="/" className="brand" onClick={closeMenu}>
          <svg className="brand-glyph" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <linearGradient id="brand-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a1035"/>
                <stop offset="100%" stopColor="#0d0d1a"/>
              </linearGradient>
              <linearGradient id="brand-accent" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8"/>
                <stop offset="50%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
              <linearGradient id="brand-flow" x1="18" y1="10" x2="26" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#brand-bg)"/>
            <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
            <path d="M7 8v16h9" stroke="url(#brand-accent)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M19 24V8h8M19 15.5h6" stroke="url(#brand-flow)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="27" cy="8" r="1.8" fill="#22d3ee" opacity="0.9"/>
            <circle cx="27" cy="8" r="3" fill="#22d3ee" opacity="0.2"/>
          </svg>
          <span className="brand-text">LearnFlow</span>
        </Link>
        <p className="sb-tagline">Learn · Teach · Grow</p>

        <nav className="sb-nav">
          <NavItems
            onNavigate={closeMenu}
            isAuthenticated={isAuthenticated}
            isInstructor={isInstructor}
            isAdmin={isAdmin}
            credentials={credentials}
          />
        </nav>

        <div className="sb-footer">
          {/* Theme toggle */}
          <button
            type="button"
            className="sb-theme-toggle"
            onClick={cycleTheme}
            title={`Theme: ${themeMeta.label} — click for ${THEME_META[themeMeta.next].label}`}
          >
            <span className="sb-theme-icon" key={preference}>{themeMeta.icon}</span>
            <span className="sb-theme-label">{themeMeta.label}</span>
            <span className="sb-theme-hint">Theme</span>
          </button>

          {isAuthenticated ? (
            <>
              <div className="sb-user-pill">
                <div className="sb-user-avatar" aria-hidden>{initials}</div>
                <div className="sb-user-info">
                  <div className="sb-user-name">{credentials?.username}</div>
                  <div className="sb-user-role">{roleLabel}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost sb-logout"
                onClick={() => { logout(); closeMenu() }}
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="sb-auth-btns">
              <Link to="/login"    className="btn btn-ghost    sb-full" onClick={closeMenu}>Log in</Link>
              <Link to="/register" className="btn btn-primary  sb-full" onClick={closeMenu}>Get started</Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="main-wrap">
        <main className="main-inner">{children}</main>
        <footer className="site-footer">
          <span className="site-footer-brand">LearnFlow</span>
          <span className="dot">·</span>
          <span>Spring Boot</span>
          <span className="dot">·</span>
          <span>React</span>
          <span className="dot">·</span>
          <span>Vite</span>
        </footer>
      </div>
    </div>
  )
}
