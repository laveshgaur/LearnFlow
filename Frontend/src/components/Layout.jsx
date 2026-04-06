import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import './Layout.css'

function NavItems({ onNavigate, isAuthenticated, isInstructor }) {
  const c = ({ isActive }) => (isActive ? 'sb-link is-active' : 'sb-link')

  return (
    <>
      <NavLink to="/" className={c} end onClick={onNavigate}>
        <span className="sb-ico" aria-hidden>⌂</span>
        Home
      </NavLink>
      <NavLink to="/courses" className={c} onClick={onNavigate}>
        <span className="sb-ico" aria-hidden>▣</span>
        Catalog
      </NavLink>
      {isAuthenticated ? (
        <>
          {isInstructor ? (
            <NavLink to="/studio" className={c} onClick={onNavigate}>
              <span className="sb-ico" aria-hidden>✎</span>
              Instructor studio
            </NavLink>
          ) : null}
          <NavLink to="/dashboard" className={c} onClick={onNavigate}>
            <span className="sb-ico" aria-hidden>◉</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin" className={c} onClick={onNavigate}>
            <span className="sb-ico" aria-hidden>⚙</span>
            Admin
          </NavLink>
        </>
      ) : null}
    </>
  )
}

export default function Layout({ children }) {
  const { isAuthenticated, isInstructor, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app-shell">
      <button
        type="button"
        className="mobile-menu-btn"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="burger" data-open={menuOpen} />
      </button>

      {menuOpen ? (
        <button type="button" className="sidebar-scrim" aria-label="Close menu" onClick={closeMenu} />
      ) : null}

      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-glyph" aria-hidden />
          <span className="brand-text">LearnFlow</span>
        </Link>
        <p className="sb-tagline">Catalog · enroll · teach</p>

        <nav className="sb-nav">
          <NavItems
            onNavigate={closeMenu}
            isAuthenticated={isAuthenticated}
            isInstructor={isInstructor}
          />
        </nav>

        <div className="sb-footer">
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-secondary sb-logout"
              onClick={() => {
                logout()
                closeMenu()
              }}
            >
              Log out
            </button>
          ) : (
            <div className="sb-auth-btns">
              <Link to="/login" className="btn btn-secondary sb-full" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary sb-full" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      <div className="main-wrap">
        <main className="main-inner">{children}</main>
        <footer className="site-footer">
          <span>LearnFlow</span>
          <span className="dot">·</span>
          <span className="muted">Spring Boot · React · Vite</span>
        </footer>
      </div>
    </div>
  )
}
