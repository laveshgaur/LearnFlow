import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="elements">LearnFlow</div>
      <div className="elements">
        <div className="links">
          <Link to="/login">Pricing</Link>
          <Link to="/login">Contact</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">SignUp</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
