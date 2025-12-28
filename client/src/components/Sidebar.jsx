import { Link } from 'react-router-dom';
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div>
        <Link to="/dashboard">DashBoard</Link>
        <Link>All Courses</Link>
        <Link>My Courses</Link>
        <Link>About Me</Link>
      </div>
    </div>
  )
}
export default Sidebar;