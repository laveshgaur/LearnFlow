import { useState } from "react";
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
      {goals.map((goal) => (
        <a href="/">
          <div className="goal-card">{goal.title}</div>
        </a>
      ))}
    </div>
  )
}
export default PopularGoals;