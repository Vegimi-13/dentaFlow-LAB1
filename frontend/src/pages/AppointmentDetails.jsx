import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Odontogram from "@/components/Odontogram";
import api from "../api/axios";

/**
 * mode:
 *  - "edit" → doctor editing from appointment
 *  - "view" → patient viewing medical record
 */
export default function AppointmentDetails({ mode = "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeeth, setSelectedTeeth] = useState([]);

  // Security: Read-only state depends on appointment status, not URL params
  const isReadOnly =
    mode === "view" || (appointment && appointment.status === "COMPLETED");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  /* =====================
     Load appointment or medical record
  ===================== */
  useEffect(() => {
    if (mode === "view") {
      // Patient viewing medical record directly by record ID
      const recordId = id;

      api
        .get(`/records/${recordId}`)
        .then((res) => {
          const record = res.data;

          // Create a mock appointment object for rendering
          setAppointment({
            id: recordId,
            date: record.createdAt,
            status: "COMPLETED",
            patient: record.patient,
            doctor: record.doctor,
          });

          // Populate form with record data
          reset({
            diagnosis: record.diagnosis || "",
            treatment: record.treatment || "",
            prescription: record.prescription || "",
            notes: record.notes || "",
          });

          setSelectedTeeth(record.teeth || []);
        })
        .catch(() => {
          toast.error("Failed to load medical record");
          navigate(-1);
        })
        .finally(() => setLoading(false));
    } else {
      // Load appointment (doctor mode)
      api
        .get(`/appointments/${id}`)
        .then((res) => {
          const appt = res.data;
          setAppointment(appt);

          // If appointment is completed, load the medical record for viewing
          if (appt.status === "COMPLETED") {
            api
              .get(`/records/by-appointment/${id}`)
              .then((recordRes) => {
                const record = recordRes.data;

                reset({
                  diagnosis: record.diagnosis || "",
                  treatment: record.treatment || "",
                  prescription: record.prescription || "",
                  notes: record.notes || "",
                });

                setSelectedTeeth(record.teeth || []);
              })
              .catch((error) => {
                console.error("No medical record found:", error);
                toast.error("No medical record found for this appointment");
                // Don't navigate away, just show the appointment without record data
              });
          }
        })
        .catch(() => {
          toast.error("Failed to load appointment");
          navigate(-1);
        })
        .finally(() => setLoading(false));
    }
  }, [id, mode, navigate, reset]);

  /* =====================
     Submit medical record (DOCTOR)
  ===================== */
  const onSubmit = async (data) => {
    // Security: Prevent editing completed appointments
    if (appointment.status === "COMPLETED") {
      toast.error("Cannot edit medical record for completed appointment");
      return;
    }

    try {
      await api.post(`/records/from-appointment/${id}`, {
        ...data,
        teeth: selectedTeeth,
      });

      toast.success("Medical record saved");
      navigate("/doctor");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save medical record");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading appointment…
      </div>
    );
  }

  if (!appointment) return null;

  const { patient, doctor } = appointment;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              {isReadOnly ? "Medical Record" : "Appointment Details"}
            </h1>
            <p className="text-slate-500 text-sm">
              {new Date(appointment.date).toLocaleDateString()} •{" "}
              {new Date(appointment.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {isReadOnly && (
                <span className="ml-3 px-3 py-1 text-xs bg-green-100 text-green-700 rounded font-medium border border-green-200">
                  Completed
                </span>
              )}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Patient */}
            <Card>
              <CardHeader>
                <CardTitle>Patient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {patient.user.firstName}{" "}
                  {patient.user.lastName}
                </div>
                <div>
                  <strong>Phone:</strong> {patient.user.phone || "—"}
                </div>
                <div>
                  <strong>Date of birth:</strong>{" "}
                  {patient.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : "—"}
                </div>
              </CardContent>
            </Card>

            {/* Doctor */}
            <Card>
              <CardHeader>
                <CardTitle>Treated by</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {doctor.firstName} {doctor.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {doctor.email}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medical details</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Diagnosis</Label>
                  <Input disabled={isReadOnly} {...register("diagnosis")} />
                </div>

                <div>
                  <Label>Treatment</Label>
                  <Input disabled={isReadOnly} {...register("treatment")} />
                </div>

                <div>
                  <Label>Prescription</Label>
                  <Input disabled={isReadOnly} {...register("prescription")} />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea disabled={isReadOnly} {...register("notes")} />
                </div>

                <div>
                  <Label>Teeth treated</Label>
                  <Odontogram
                    value={selectedTeeth}
                    onChange={setSelectedTeeth}
                    readOnly={isReadOnly}
                  />
                </div>

                {!isReadOnly && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      Save & complete
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
