const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* <div> */}
        <h1>Welcome Back</h1>
        <div className="dashboard-div-1">
          <div className="dashoard-div-1-left-di">
            <div className="myProgress">
              <h3>My Progress</h3>
            </div>
            <div className="activeCourses">
              <div className="active-heading">Active Courses</div>
              <div className="active">
                <div className="courses">
                  <h3>Web Development Bootcamp</h3>
                  <h4>Web Development</h4>
                  <h3>Progress</h3>
                </div>
                <div className="courses">
                  <h3>Data Science Fundamentals</h3>
                  <h4>Data Science</h4>
                  <h3>Progress</h3>
                </div>
            </div>  
            </div>
            
          </div>
          <div className="dashoard-div-1-right-right">

          </div>
        </div>
        <div className="dashboard-div-2"></div>
      {/* </div> */}
    </div>
  )
}
export default Dashboard;