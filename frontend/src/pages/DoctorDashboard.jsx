import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../contexts/AuthContext"
import {
  getMyDoctorAppointments,
  updateAppointmentStatus,
} from "../api/appointment"

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // pagination
  const [page, setPage] = useState(1)
  const pageSize = 5

  const loadAppointments = async () => {
    try {
      const res = await getMyDoctorAppointments()
      setAppointments(res.data)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
  }, [])

  /* =====================
     Derived data
  ===================== */

  const patientsCount = new Set(
    appointments.map((a) => a.patient.id),
  ).size

  const nextAppointment = appointments.find(
    (a) => new Date(a.date) > new Date(),
  )

  const todayCount = appointments.filter(
    (a) =>
      new Date(a.date).toDateString() ===
      new Date().toDateString(),
  ).length

  // status priority
  const statusOrder = {
    PENDING: 1,
    CONFIRMED: 2,
    COMPLETED: 3,
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return new Date(a.date) - new Date(b.date)
  })

  const paginatedAppointments = sortedAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  )

  /* =====================
     Actions
  ===================== */

  const confirmAppointment = async (id) => {
    await updateAppointmentStatus(id, "CONFIRMED")
    loadAppointments()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Doctor dashboard
            </h1>
            <p className="text-slate-500 text-sm">
              Logged in as {user?.email}
            </p>
          </div>

          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{patientsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                
                Next appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <>
                  <p className="font-medium">
                    {new Date(nextAppointment.date).toLocaleDateString()} •{" "}
                    {new Date(nextAppointment.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs text-slate-500">
                    Patient:{" "}
                    {nextAppointment.patient.firstName}{" "}
                    {nextAppointment.patient.lastName}
                  </p>
                </>
              ) : (
                <p className="text-slate-400">No upcoming</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{todayCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>My appointments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading && <p className="text-slate-500">Loading…</p>}

            {!loading && appointments.length === 0 && (
              <p className="text-slate-500">No appointments yet.</p>
            )}

            {paginatedAppointments.map((appt) => (
              <div
                key={appt.id}
                className="border rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {new Date(appt.date).toLocaleDateString()} •{" "}
                    {new Date(appt.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-sm text-slate-500">
                    Patient: {appt.patient.firstName}{" "}
                    {appt.patient.lastName}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded border ${
                      appt.status === "PENDING"
                        ? "border-yellow-400 text-yellow-700"
                        : appt.status === "CONFIRMED"
                        ? "border-blue-400 text-blue-700"
                        : "border-green-400 text-green-700"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {appt.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={() => confirmAppointment(appt.id)}
                    >
                      Confirm
                    </Button>
                  )}

                  {appt.status === "CONFIRMED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        navigate(`/doctor/appointments/${appt.id}`)
                      }
                    >
                      Open
                    </Button>
                  )}

                  {appt.status === "COMPLETED" && (
                    <Button size="sm" disabled>
                      Completed
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {appointments.length > pageSize && (
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <span className="text-sm text-slate-500">
                  Page {page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * pageSize >= appointments.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}