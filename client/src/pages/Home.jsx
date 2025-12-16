import Login from "./Login";
import PopularGoals from "./PopularGoals";
import SignUp from "./SignUp";

const Home = () => {
  return (
    <div className="home">
      <h2>Popular Goals</h2>
      <PopularGoals />
      {/* <Login /> */}
      {/* <SignUp /> */}
    </div>
  )
}
export default Home;