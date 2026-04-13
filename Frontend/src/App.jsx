import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Courses from './pages/Courses.jsx'
import Studio from './pages/Studio.jsx'
import StudioCourse from './pages/StudioCourse.jsx'
import CourseViewer from './pages/CourseViewer.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseViewer />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/studio/course/:courseId" element={<StudioCourse />} />
        <Route path="/teach" element={<Studio />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  )
}
