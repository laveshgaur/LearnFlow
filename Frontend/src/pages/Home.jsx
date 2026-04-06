import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { isAuthenticated, isInstructor } = useAuth()

  return (
    <div className="page-wide">
      <section className="hero-marketing">
        <h1>Learn without friction.</h1>
        <p>
          Browse the public catalog, purchase with <code>POST /user/purchase-course</code>, and—if you have{' '}
          <code>INSTRUCTOR</code>—manage courses in the studio behind <code>/instructor/**</code>.
        </p>
        <div className="actions" style={{ justifyContent: 'center' }}>
          <Link to="/courses" className="btn btn-primary">
            Open catalog
          </Link>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-secondary">
              Create account
            </Link>
          ) : isInstructor ? (
            <Link to="/studio" className="btn btn-secondary">
              Instructor studio
            </Link>
          ) : (
            <Link to="/dashboard" className="btn btn-secondary">
              Dashboard
            </Link>
          )}
        </div>
      </section>

      <div className="stats-row">
        <div className="stat-tile">
          <p className="value">GET</p>
          <p className="label muted">Public courses</p>
        </div>
        <div className="stat-tile">
          <p className="value">POST</p>
          <p className="label muted">Purchase & create</p>
        </div>
        <div className="stat-tile">
          <p className="value">RBAC</p>
          <p className="label muted">ADMIN · INSTRUCTOR · USER</p>
        </div>
      </div>

      <div className="home-grid">
        <div className="card card-ghost home-tile">
          <span className="tile-kicker">Learners</span>
          <h2>Catalog & enroll</h2>
          <p className="muted" style={{ margin: 0 }}>
            <code>GET /courses</code> is public. Sign in to call <code>/user/purchase-course/&#123;id&#125;</code> on{' '}
            <strong>PUBLISHED</strong> listings.
          </p>
        </div>
        <div className="card card-ghost home-tile">
          <span className="tile-kicker tile-kicker-inst">Instructors</span>
          <h2>Studio</h2>
          <p className="muted" style={{ margin: 0 }}>
            Requires <code>ROLE_INSTRUCTOR</code>. List yours with <code>GET /instructor/get-courses</code>, create,
            update, and delete with the verbs under <code>/instructor</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
