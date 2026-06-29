import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, useThemeStore } from './store'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import AskAI from './pages/AskAI'
import RaiseQuery from './pages/RaiseQuery'
import Discussions from './pages/Discussions'
import QueryDetail from './pages/QueryDetail'
import Analytics from './pages/Analytics'
import Announcements from './pages/Announcements'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import FAQBrowser from './pages/FAQBrowser'
import UploadPhotos from './pages/UploadPhotos'

function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore(state => state.token)
  return !token ? children : <Navigate to="/home" replace />
}

export default function App() {
  const user = useAuthStore(state => state.user)
  const setTheme = useThemeStore(state => state.setTheme)

  useEffect(() => {
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme)
    }
  }, [user?.preferences?.theme, setTheme])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="home" element={<Home />} />
        <Route path="ask" element={<AskAI />} />
        <Route path="upload-photos" element={<UploadPhotos />} />
        <Route path="raise-query" element={<RaiseQuery />} />
        <Route path="discussions" element={<Discussions />} />
        <Route path="discussions/:id" element={<QueryDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="faq" element={<FAQBrowser />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
