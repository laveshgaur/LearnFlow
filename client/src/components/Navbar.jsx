const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>LearnFlow</h1>
      <div>
        <a href="/">Pricing</a>
        <a href="/">Contact</a>
        <a href="/">Login</a>
        <a href="/" className="signup-link">Sign Up</a>
      </div>
    </nav>
  )
}
export default Navbar;