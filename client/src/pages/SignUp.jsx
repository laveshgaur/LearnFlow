import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="form" id="signup-page">
      <h2>SignUp</h2>
      <label htmlFor="name">Enter Your Name</label>
      <input type="text" id="name" placeholder="Enter Your Name"/>
      <label htmlFor="email">Enter Your Email</label>
      <input type="text" id="email" placeholder="Enter Your Email"/>
      <label htmlFor="password">Enter Your Password</label>
      <input type="password" id="password" placeholder="Enter Your Password"/>
      <button className="signup-button">SignUp</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}
export default SignUp;