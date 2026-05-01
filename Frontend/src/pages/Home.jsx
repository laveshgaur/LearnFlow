import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const FEATURES = [
  {
    icon: '◈',
    title: 'Rich Catalog',
    desc: 'Explore hundreds of courses across every discipline. Filter by topic, level, and price — no account needed.',
    color: 'var(--indigo)',
    glow: 'rgba(99,102,241,0.4)',
  },
  {
    icon: '✦',
    title: 'Teach & Earn',
    desc: 'Create professional courses with modules, chapters, and video uploads. Your studio, your rules.',
    color: 'var(--amber)',
    glow: 'rgba(251,191,36,0.35)',
  },
  {
    icon: '◉',
    title: 'Track Progress',
    desc: 'Your personal dashboard keeps all enrolled courses in one place, with role-aware navigation.',
    color: 'var(--emerald)',
    glow: 'rgba(52,211,153,0.35)',
  },
]

const STATS = [
  { value: 'RBAC',       label: 'Role-based access' },
  { value: 'JWT-free',   label: 'HTTP Basic + BCrypt' },
  { value: '4-tier',     label: 'Course → Module → Chapter → Video' },
]

export default function Home() {
  const { isAuthenticated, isInstructor } = useAuth()

  return (
    <div className="page-wide">
      {/* ── Hero ── */}
      <section className="hero-marketing">
        <div className="hero-glow" />
        <div className="hero-eyebrow">
          <span className="hero-dot" />
          Open platform · Free to join
        </div>
        <h1>
          Learn without<br />
          <em>limits</em>.
        </h1>
        <p>
          Browse a live catalog, enroll instantly, and—if you teach—publish courses
          with full module & video management. All under one roof.
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-primary btn-lg">
            Browse catalog →
          </Link>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create free account
            </Link>
          ) : isInstructor ? (
            <Link to="/studio" className="btn btn-secondary btn-lg">
              Open Studio
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              My Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-row">
        {STATS.map(s => (
          <div className="stat-tile" key={s.label}>
            <p className="value">{s.value}</p>
            <p className="label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Feature tiles ── */}
      <div className="home-grid" style={{ marginTop: '1rem' }}>
        {FEATURES.map(f => (
          <div className="card card-ghost home-tile" key={f.title}>
            <div
              className="home-tile-icon"
              style={{ background: `${f.color}20`, color: f.color }}
            >
              {f.icon}
            </div>
            <h2>{f.title}</h2>
            <p>{f.desc}</p>
            <div
              className="tile-glow"
              style={{ background: f.glow }}
            />
          </div>
        ))}
      </div>

      {/* ── Bottom CTA ── */}
      <div
        className="card"
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(167,139,250,0.08))',
          borderColor: 'rgba(99,102,241,0.25)',
        }}
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>
          Ready to start learning?
        </h2>
        <p className="muted" style={{ marginBottom: '1.5rem', maxWidth: '40ch', margin: '0 auto 1.5rem' }}>
          Join thousands of learners and instructors building skills every day on LearnFlow.
        </p>
        {!isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary">Sign up free</Link>
            <Link to="/login"    className="btn btn-ghost">Log in</Link>
          </div>
        ) : (
          <Link to="/courses" className="btn btn-primary">Explore courses</Link>
        )}
      </div>
    </div>
  )
}
