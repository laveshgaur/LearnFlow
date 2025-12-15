import Login from "./Login";
import PopularGoals from "./PopularGoals";

const Home = () => {
  return (
    <div className="home">
      <h2>Popular Goals</h2>
      <PopularGoals />
      {/* <Login /> */}
    </div>
  )
}
export default Home;