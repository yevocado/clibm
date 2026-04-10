import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoadingSpinner from './components/common/LoadingSpinner'
import Navbar from './components/layout/Navbar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import RoutesPage from './pages/RoutesPage'
import ProgressPage from './pages/ProgressPage'
import GoalPage from './pages/GoalPage'
import GymSettingsPage from './pages/GymSettingsPage'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function PublicOnly() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/visits" element={<Navigate to="/routes" replace />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/goal" element={<GoalPage />} />
            <Route path="/gyms" element={<GymSettingsPage />} />
            <Route path="/gyms/new" element={<GymSettingsPage initialModal />} />
            <Route path="/gyms/:gymId" element={<GymSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
