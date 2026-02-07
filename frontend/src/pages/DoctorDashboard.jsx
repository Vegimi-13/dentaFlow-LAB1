import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";
import {
  getMyDoctorAppointments,
  updateAppointmentStatus,
} from "../api/appointment";
import DoctorProfileModal from "../components/DoctorProfileModal";
import { getMyProfile } from "../api/auth";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // NEW
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to load profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getMyDoctorAppointments();
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAppointments();
  }, []);

  /* =====================
     Profile completion check
  ===================== */

  const isProfileComplete =
    profile &&
    Boolean(profile.firstName) &&
    Boolean(profile.lastName) &&
    Boolean(profile.phone);

  const handleProfileSuccess = async () => {
    await loadProfile();
    setProfileModalOpen(false);
  };

  /* =====================
     Derived stats
  ===================== */

  const patientsCount = new Set(appointments.map((a) => a.patient.id)).size;

  const nextAppointment = appointments.find(
    (a) => new Date(a.date) > new Date(),
  );

  const todayCount = appointments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString(),
  ).length;

  /* =====================
     Filtering + Search
  ===================== */

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appt) => {
        // status filter
        if (statusFilter !== "ALL" && appt.status !== statusFilter) {
          return false;
        }

        // search filter
        if (search.trim() !== "") {
          const fullName =
            `${appt.patient.user.firstName} ${appt.patient.user.lastName}`.toLowerCase();

          return fullName.includes(search.toLowerCase());
        }

        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [appointments, statusFilter, search]);

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  /* =====================
     Actions
  ===================== */

  const confirmAppointment = async (id) => {
    await updateAppointmentStatus(id, "CONFIRMED");
    loadAppointments();
  };

  const cancelAppointment = async (id) => {
    await updateAppointmentStatus(id, "CANCELLED");
    loadAppointments();
  };

  /* =====================
     Render
  ===================== */

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
              Logged in as{" "}
              {isProfileComplete && profile
                ? `Dr. ${profile.firstName} ${profile.lastName}`
                : user?.email}
            </p>
          </div>

          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Profile Loading */}
        {profileLoading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-slate-500">Loading profile...</p>
          </div>
        )}

        {/* Profile Incomplete - Force Profile Completion */}
        {!profileLoading && !isProfileComplete && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Please complete your profile to access the dashboard. We need
                  your name and phone number to display in the system.
                </p>
                <Button
                  onClick={() => setProfileModalOpen(true)}
                  className="w-full"
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Dashboard - Profile Complete */}
        {!profileLoading && isProfileComplete && (
          <>
            {/* Doctor Profile Button */}
            <div className="flex justify-start">
              <Button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2"
              >
                Update Profile
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="Patients" value={patientsCount} />

              <StatCard
                title="Next appointment"
                value={
                  nextAppointment
                    ? new Date(nextAppointment.date).toLocaleDateString()
                    : "No upcoming"
                }
                sub={
                  nextAppointment
                    ? `${nextAppointment.patient.user.firstName} ${nextAppointment.patient.user.lastName}`
                    : null
                }
              />

              <StatCard title="Today" value={todayCount} />
            </div>

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>My appointments</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* FILTERS */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Search patient..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {loading && <p className="text-slate-500">Loading…</p>}

                {!loading && filteredAppointments.length === 0 && (
                  <p className="text-slate-500">No appointments found.</p>
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
                        Patient: {appt.patient.user.firstName}{" "}
                        {appt.patient.user.lastName}
                      </p>

                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="flex gap-2">
                      {appt.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => confirmAppointment(appt.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelAppointment(appt.id)}
                          >
                            Cancel
                          </Button>
                        </>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/doctor/appointments/${appt.id}?view=true`,
                            )
                          }
                        >
                          View record
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {filteredAppointments.length > pageSize && (
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-slate-500">Page {page}</span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page * pageSize >= filteredAppointments.length}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Doctor Profile Modal */}
      <DoctorProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onSuccess={handleProfileSuccess}
      />
    </div>
  );
}

/* helpers */

function StatCard({ title, value, sub }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: "border-yellow-400 text-yellow-700",
    CONFIRMED: "border-blue-400 text-blue-700",
    COMPLETED: "border-green-400 text-green-700",
    CANCELLED: "border-red-400 text-red-700",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}
