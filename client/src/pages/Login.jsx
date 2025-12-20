import { Link } from "react-router-dom";
const Login = () => {
  return (
    <form className="form" id="login-page">
      <h2>Login</h2>
      <label htmlFor="email">Email Address</label>
      <input type="text" id="email" placeholder="Enter Your Email"/>
      <label htmlFor="password">Password</label>
      <input type="password" id="password" placeholder="Enter Your Password"/>
      <button className="loginButton">Login</button>
      <p>Don't have an account? <Link to="/signup">SignUp</Link></p>
    </form>
  )
}
export default Login;