import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookAppointmentModal from "../components/BookAppointmentModal";
import { getMyAppointments } from "../api/appointment";

import { useAuth } from "../contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "../api/patient";
import CompleteProfileForm from "../components/CompleteProfileForm";
const statusStyles = {
  PENDING: "border border-yellow-400 text-yellow-700 bg-yellow-50",
  CONFIRMED: "border border-blue-400 text-blue-700 bg-blue-50",
  COMPLETED: "border border-green-400 text-green-700 bg-green-50",
  CANCELLED: "border border-red-400 text-red-700 bg-red-50",
};

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [appointments, setAppointments] = useState([]);

  //here
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const [now, setNow] = useState(new Date());
  const loadAppointments = () => {
    getMyAppointments()
      .then((res) => {
        console.log("APPOINTMENTS:", res.data);
        setAppointments(res.data);
      })
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
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  //ketu
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const paginatedAppointments = appointments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Hello{user?.email ? `, ${user.email}` : ""}
            </h1>
            <p className="text-slate-500 text-sm">Patient dashboard</p>
            <p className="text-slate-500 text-sm">
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="transition hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Next appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">—</p>
            </CardContent>
          </Card>

          <Card className="transition hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Total visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">—</p>
            </CardContent>
          </Card>

          <Card className="transition hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-sm text-slate-500">
                Medical records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">—</p>
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
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">Manage your appointments</p>

                  <Button onClick={() => setOpenBooking(true)}>
                    Book new appointment
                  </Button>
                </div>

                {/* appointments list will go here */}
                {appointments.length === 0 && (
                  <p className="text-slate-500">No appointments yet.</p>
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
                        className={`text-sm px-2 py-1 rounded capitalize font-medium ${
                          statusStyles[appt.status] ||
                          "border border-slate-300 text-slate-600"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
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
                </div>
              </TabsContent>

              {/* Records */}
              <TabsContent value="records" className="pt-6">
                <p className="text-slate-500">
                  Your medical history will appear here.
                </p>
              </TabsContent>

              {/* Profile */}
              <TabsContent value="profile" className="pt-6">
                {loading && <p className="text-slate-500">Loading profile…</p>}

                {!loading && !profile && (
                  <CompleteProfileForm onSuccess={(data) => setProfile(data)} />
                )}

                {!loading && profile && !editMode && (
                  <div className="space-y-3 text-slate-700">
                    <div>
                      <strong>Name:</strong> {profile.firstName}{" "}
                      {profile.lastName}
                    </div>

                    <div>
                      <strong>Email:</strong> {user?.email}
                    </div>

                    <div>
                      <strong>Phone:</strong> {profile.phone || "—"}
                    </div>

                    <div>
                      <strong>National ID:</strong> {profile.nationalId || "—"}
                    </div>

                    <div>
                      <strong>Date of birth:</strong>{" "}
                      {profile.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </div>

                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setEditMode(true)}
                    >
                      Edit profile
                    </Button>
                  </div>
                )}

                {!loading && profile && editMode && (
                  <CompleteProfileForm
                    initialValues={profile}
                    onSuccess={(data) => {
                      setProfile(data);
                      setEditMode(false);
                    }}
                    onCancel={() => setEditMode(false)}
                    submitAction={updateMyProfile}
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
          // later we will refetch appointments here
          loadAppointments();
        }}
      />
    </div>
  );
}
