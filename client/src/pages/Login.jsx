import { Link } from "react-router-dom";
import { useState } from "react";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with", { email, password });
  };
  return (
    <form  onSubmit={handleSubmit} className="form" id="login-page">
      <h2>Login</h2>
      <label htmlFor="email">Email Address</label>
      <input 
        type="email" 
        id="email" 
        placeholder="Enter Your Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="password">Password</label>
      <input 
        type="password" 
        id="password" 
        placeholder="Enter Your Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" className="loginButton">Login</button>
      <p>Don't have an account? <Link to="/signup">SignUp</Link></p>
    </form>
  )
}
export default Login;