import { useAuth } from "../contexts/AuthContext"

export default function PatientDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Patient Dashboard</h1>
      <p>User ID: {user?.id}</p>
      <button onClick={logout} className="underline">Logout</button>
    </div>
  )
}