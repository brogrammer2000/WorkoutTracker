import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import DashboardPage from '@/pages/DashboardPage'
import LoginPage from '@/pages/LoginPage'
import WorkoutsPage from '@/pages/WorkoutsPage'
import OnboardingPage from '@/pages/OnboardingPage'
import ChatPage from '@/pages/ChatPage'

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const { profile, isLoading: profileLoading } = useProfile()

  if (authLoading || (session && profileLoading)) {
    return <div style={loadingStyle}>Loading…</div>
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  if (profile && !profile.onboarding_completed) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/workouts" element={<WorkoutsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const loadingStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
  fontSize: 14,
}
