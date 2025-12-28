import PopularGoals from "./PopularGoals";

import { Outlet } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      {/* <h2>Popular Goals</h2> */}
      {/* <PopularGoals /> */}
      <Outlet />
    </div>
  )
}
export default Home;