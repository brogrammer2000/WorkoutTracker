import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import WorkoutsPage from '@/pages/WorkoutsPage'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/" element={session ? <DashboardPage /> : <Navigate to="/login" replace />} />
      <Route path="/workouts" element={session ? <WorkoutsPage /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
