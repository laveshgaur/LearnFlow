import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
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

export default function Layout({ children }) {
  const { isAuthenticated, isInstructor, isAdmin, logout, credentials } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

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
          <span className="brand-glyph" aria-hidden />
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
