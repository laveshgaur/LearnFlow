import { Link } from "react-router-dom";
import { useState } from "react";
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Account created and logged in successfully");
}

  return (
    <div style={{ padding: '2px 16px' }}>
      <form onSubmit={handleSubmit} className="form" id="signup-page">
        <h2>SignUp</h2>
        <label htmlFor="name">Enter Your Name</label>
        <input 
          type="text" 
          id="name" 
          placeholder="Enter Your Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="email">Enter Your Email</label>
        <input 
          type="email" 
          id="email" 
          placeholder="Enter Your Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Enter Your Password</label>
        <input 
          type="password" 
          id="password" 
          placeholder="Enter Your Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="signup-button">SignUp</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
export default SignUp;