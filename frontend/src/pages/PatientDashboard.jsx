import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { useAuth } from "../contexts/AuthContext";
import { getMyProfile, updateMyProfile } from "../api/patient";
import CompleteProfileForm from "../components/CompleteProfileForm";

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [now, setNow] = useState(new Date());

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
              <TabsContent value="appointments" className="pt-6">
                <p className="text-slate-500">
                  Your appointments will appear here.
                </p>
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
    </div>
  );
}
