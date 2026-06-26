import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { session, signOut } = useAuth()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session?.user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
