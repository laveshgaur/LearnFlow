import { Link } from 'react-router-dom';
const Sidebar = () => {
  return (
    <div className="sidebar">
        <Link to="/dashboard">DashBoard</Link>
        <Link>All Courses</Link>
        <Link>My Courses</Link>
        <Link>About Me</Link>
    </div>
  )
}
export default Sidebar;