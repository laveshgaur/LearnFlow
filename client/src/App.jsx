import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from "./pages/Login";
import SignUp from './pages/SignUp';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path='/' element = {<Home />}/>
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
        </Routes>
    </div>
    </Router>
  );
}

export default App;
