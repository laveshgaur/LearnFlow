import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>LearnFlow</h1>

      <div className="links">
        <Link to="/login">Pricing</Link>
        <Link to="/login">Contact</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup" className="signup-link">Sign Up</Link>
      </div>
    </nav>
  );
};

export default Navbar;
