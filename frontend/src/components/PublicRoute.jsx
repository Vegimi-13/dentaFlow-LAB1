import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function PublicRoute({ children }) {
  const { user } = useAuth()

  if (user) {
    if (user.role === "PATIENT") return <Navigate to="/patient" />
    if (user.role === "DOCTOR") return <Navigate to="/doctor" />
    if (user.role === "ADMIN") return <Navigate to="/admin" />
  }

  return children
}