import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { getMyAppointments } from "../api/appointment";
import { getMyMedicalRecords } from "../api/medicalRecord";
import { useAuth } from "../contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "../api/patient";
import CompleteProfileForm from "../components/CompleteProfileForm";

/* =====================
   Constants
===================== */

const ITEMS_PER_PAGE = 5;

const statusStyles = {
  PENDING: "border border-yellow-400 text-yellow-700 bg-yellow-50",
  CONFIRMED: "border border-blue-400 text-blue-700 bg-blue-50",
  COMPLETED: "border border-green-400 text-green-700 bg-green-50",
  CANCELLED: "border border-red-400 text-red-700 bg-red-50",
};

const statusPriority = {
  PENDING: 1,
  CONFIRMED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
};

/* =====================
   Component
===================== */

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  // data
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState(null);

  // ui
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [now, setNow] = useState(new Date());

  // filters & pagination
  const [page, setPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================
     Fetch helpers
  ===================== */

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await getMyAppointments();
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await getMyMedicalRecords();
      setRecords(res.data);
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  /* =====================
     Effects
  ===================== */

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    fetchRecords();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* =====================
     Derived data
  ===================== */

  const isProfileComplete =
    Boolean(profile?.user?.firstName) &&
    Boolean(profile?.user?.lastName) &&
    Boolean(profile?.user?.phone) &&
    Boolean(profile?.dateOfBirth);

  const nextAppointment = appointments.find(
    (a) => new Date(a.date) > new Date(),
  );

  const completedVisits = appointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  const applyTimeFilter = (list) => {
    if (timeFilter === "ALL") return list;

    const now = new Date();
    const cutoff = new Date();

    if (timeFilter === "24H") cutoff.setHours(now.getHours() - 24);
    if (timeFilter === "7D") cutoff.setDate(now.getDate() - 7);
    if (timeFilter === "30D") cutoff.setDate(now.getDate() - 30);

    return list.filter((a) => new Date(a.date) >= cutoff);
  };

  const filteredAppointments = applyTimeFilter(
    statusFilter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === statusFilter),
  ).sort((a, b) => {
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    return new Date(a.date) - new Date(b.date);
  });

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* =====================
     Render
  ===================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              Hello{user?.email ? `, ${user.email}` : ""}
            </h1>
            <p className="text-sm text-slate-500">Patient dashboard</p>
            <p className="text-sm text-slate-500">
              {now.toLocaleDateString()} •{" "}
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Next appointment"
            value={
              nextAppointment
                ? `${new Date(nextAppointment.date).toLocaleDateString()} • ${new Date(
                    nextAppointment.date,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "No upcoming"
            }
            sub={
              nextAppointment
                ? `Doctor: ${nextAppointment.doctor?.email ?? "—"}`
                : null
            }
          />

          <StatCard title="Total visits" value={completedVisits} />
          <StatCard title="Medical records" value={records.length} />
        </div>

        {/* Main */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="appointments">
              <TabsList>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="records">Medical records</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              {/* Appointments */}
              <TabsContent value="appointments" className="pt-6 space-y-4">
                {!isProfileComplete && (
                  <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm">
                    ⚠️ Complete your profile before booking an appointment.
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <div className="flex gap-2">
                    <select
                      value={timeFilter}
                      onChange={(e) => {
                        setTimeFilter(e.target.value);
                        setPage(1);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="ALL">All time</option>
                      <option value="24H">Last 24h</option>
                      <option value="7D">Last 7 days</option>
                      <option value="30D">Last 30 days</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="ALL">All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <Button
                    disabled={!isProfileComplete}
                    onClick={() => setOpenBooking(true)}
                  >
                    Book new appointment
                  </Button>
                </div>

                <div className="space-y-3">
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
                          Doctor: {appt.doctor?.email ?? "—"}
                        </p>
                      </div>

                      <span
                        className={`text-sm px-2 py-1 rounded font-medium ${
                          statusStyles[appt.status]
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Records */}
              <TabsContent value="records" className="pt-6">
                {loadingRecords ? (
                  <p className="text-slate-500">Loading medical records…</p>
                ) : records.length === 0 ? (
                  <p className="text-slate-500">No medical records found.</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {[...records]
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                      )
                      .map((r) => (
                        <Card key={r.id}>
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex justify-between">
                              <h3 className="font-semibold text-sm">
                                {r.title || "Medical record"}
                              </h3>
                              <span className="text-xs text-slate-500">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {r.diagnosis && (
                              <p>
                                <strong>Diagnosis:</strong> {r.diagnosis}
                              </p>
                            )}
                            {r.treatment && (
                              <p>
                                <strong>Treatment:</strong> {r.treatment}
                              </p>
                            )}
                            {r.notes && (
                              <p>
                                <strong>Notes:</strong> {r.notes}
                              </p>
                            )}

                            <p className="text-xs text-slate-500">
                              Doctor: {r.doctor?.email ?? "—"}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="pt-6">
                {loadingProfile && <p>Loading profile…</p>}

                {!loadingProfile && !profile && (
                  <CompleteProfileForm onSuccess={fetchProfile} />
                )}

                {!loadingProfile && profile && !editMode && (
                  <div className="space-y-2">
                    <p>
                      <strong>First name:</strong>{" "}
                      {profile.user?.firstName ?? "—"}
                    </p>
                    <p>
                      <strong>Last name:</strong>{" "}
                      {profile.user?.lastName ?? "—"}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {profile.user.phone || "—"}
                    </p>
                    <p>
                      <strong>Date of birth:</strong>{" "}
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </p>

                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      Edit profile
                    </Button>
                  </div>
                )}

                {!loadingProfile && profile && editMode && (
                  <CompleteProfileForm
                    initialValues={{
                      firstName: profile.user?.firstName || "",
                      lastName: profile.user?.lastName || "",
                      phone: profile.phone || "",
                      dateOfBirth: profile.dateOfBirth
                        ? profile.dateOfBirth.split("T")[0]
                        : "",
                    }}
                    submitAction={updateMyProfile}
                    onSuccess={async () => {
                      await fetchProfile();
                      setEditMode(false);
                    }}
                    onCancel={() => setEditMode(false)}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <BookAppointmentModal
        open={openBooking}
        onClose={() => setOpenBooking(false)}
        onSuccess={() => {
          setOpenBooking(false);
          fetchAppointments();
        }}
      />
    </div>
  );
}

/* =====================
   Helper
===================== */

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
