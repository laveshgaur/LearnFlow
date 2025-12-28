import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from "./pages/Login";
import SignUp from './pages/SignUp';
import Sidebar from './components/Sidebar';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Route with sidebar */}
          <Route element={
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Home />
              </main>
            </div>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>


          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;
