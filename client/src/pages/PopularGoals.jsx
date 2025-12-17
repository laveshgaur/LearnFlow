import { useState } from "react";
import { Link } from "react-router-dom";
const PopularGoals = () => {
  const [goals,setGoals] = useState([
    {title: "UPSC CSE - GS"},
    {title: "IIT JEE"},
    {title: "NEET UG"},
    {title: "Bank exams"},
    {title: "SSC JE & state AE exams"},
    {title: "CAT & other MBA entrance tests"},
    {title: "CBSE class 12"},
    {title: "CA Intermediate"}
  ])
  return (
    <div className="goals">
      {goals.map((goal, index) => (
        <Link to="/login" key={index}>
          <div className="goal-card">{goal.title}</div>
        </Link>
      ))}
    </div>
  )
}
export default PopularGoals;