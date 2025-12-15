const Login = () => {
  return (
    <div className="login">
      <h2>Login</h2>
      <label htmlFor="email">Email Address</label>
      <input type="text" id="email" placeholder="Enter Your Email"/>
      <label htmlFor="password">Password</label>
      <input type="password" id="password" placeholder="Enter Your Password"/>
      <button className="loginButton">Login</button>
      <p>Don't have an account? <a href="/">SignUp</a></p>
    </div>
  )
}
export default Login;