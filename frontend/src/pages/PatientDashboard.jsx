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

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  // core data
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [profile, setProfile] = useState(null);

  // ui state
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [now, setNow] = useState(new Date());

  // pagination
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  // filters
  const [timeFilter, setTimeFilter] = useState("ALL"); // ALL | 24H | 7D | 30D
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PENDING | CONFIRMED | COMPLETED

  /* =====================
     Fetching
  ===================== */

  const loadAppointments = () => {
    getMyAppointments()
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getMyMedicalRecords()
      .then((res) => setRecords(res.data))
      .catch(() => setRecords([]))
      .finally(() => setRecordsLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* =====================
     Derived data
  ===================== */

  const nextAppointment = appointments.find(
    (a) => new Date(a.date) > new Date(),
  );

  const completedVisits = appointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  const applyTimeFilter = (list) => {
    if (timeFilter === "ALL") return list;

    const now = new Date();
    let cutoff = new Date();

    if (timeFilter === "24H") cutoff.setHours(now.getHours() - 24);
    if (timeFilter === "7D") cutoff.setDate(now.getDate() - 7);
    if (timeFilter === "30D") cutoff.setDate(now.getDate() - 30);

    return list.filter((a) => new Date(a.date) >= cutoff);
  };

  const filteredAppointments = applyTimeFilter(
  statusFilter === "ALL"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter)
).sort((a, b) => {
  // 1️⃣ status order (PENDING → CONFIRMED → COMPLETED)
  if (statusPriority[a.status] !== statusPriority[b.status]) {
    return statusPriority[a.status] - statusPriority[b.status];
  }

  // 2️⃣ same status → earlier appointment first
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
                    Doctor: {nextAppointment.doctor.email}
                  </p>
                </>
              ) : (
                <p className="text-slate-400">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Total visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{completedVisits}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Medical records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{records.length}</p>
            </CardContent>
          </Card>
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
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <p className="text-slate-500">Manage your appointments</p>

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

                    <Button onClick={() => setOpenBooking(true)}>
                      Book new appointment
                    </Button>
                  </div>
                </div>

                {filteredAppointments.length === 0 && (
                  <p className="text-slate-500">
                    No appointments match your filters.
                  </p>
                )}

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
                          Doctor: {appt.doctor.email}
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

                {totalPages > 1 && (
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-slate-500">
                      Page {page} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Records */}
              <TabsContent value="records" className="pt-6">
                {recordsLoading ? (
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
                              Doctor: {r.doctor?.email}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="pt-6">
                {loading && <p>Loading profile…</p>}

                {!loading && !profile && (
                  <CompleteProfileForm onSuccess={setProfile} />
                )}

                {!loading && profile && !editMode && (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {profile.firstName}{" "}
                      {profile.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {profile.phone || "—"}
                    </p>
                    <Button variant="outline" onClick={() => setEditMode(true)}>
                      Edit profile
                    </Button>
                  </div>
                )}

                {!loading && profile && editMode && (
                  <CompleteProfileForm
                    initialValues={profile}
                    submitAction={updateMyProfile}
                    onSuccess={(p) => {
                      setProfile(p);
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
          loadAppointments();
        }}
      />
    </div>
  );
}
