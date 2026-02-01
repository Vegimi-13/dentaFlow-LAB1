import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import api from "../api/axios"

export default function AppointmentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  /* =====================
     Load appointment
  ===================== */
  useEffect(() => {
    api
      .get(`/appointments/${id}`)
      .then((res) => setAppointment(res.data))
      .catch(() => {
        toast.error("Failed to load appointment")
        navigate("/doctor")
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  /* =====================
     Submit medical record
  ===================== */
  const onSubmit = async (data) => {
    try {
      await api.post(`/records/from-appointment/${id}`, data)
      toast.success("Appointment completed")
      navigate("/doctor")
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to save medical record"
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading appointment…
      </div>
    )
  }

  if (!appointment) return null

  const { patient } = appointment

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Appointment details
            </h1>
            <p className="text-slate-500 text-sm">
              {new Date(appointment.date).toLocaleDateString()} •{" "}
              {new Date(appointment.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Patient info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div>
                <strong>Name:</strong> {patient.firstName}{" "}
                {patient.lastName}
              </div>

              <div>
                <strong>Phone:</strong> {patient.phone || "—"}
              </div>

              <div>
                <strong>Date of birth:</strong>{" "}
                {patient.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "—"}
              </div>

              <div>
                <strong>Status:</strong>{" "}
                <span className="capitalize">{appointment.status}</span>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Medical record */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medical record</CardTitle>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label>Diagnosis</Label>
                  <Input
                    {...register("diagnosis", { required: true })}
                    placeholder="Diagnosis"
                  />
                </div>

                <div>
                  <Label>Treatment</Label>
                  <Input
                    {...register("treatment", { required: true })}
                    placeholder="Treatment performed"
                  />
                </div>

                <div>
                  <Label>Prescription</Label>
                  <Input
                    {...register("prescription")}
                    placeholder="Prescription (optional)"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    {...register("notes")}
                    placeholder="Additional notes"
                  />
                </div>

                {/* Later: dental chart goes HERE */}
                <div className="border border-dashed rounded-md p-4 text-sm text-slate-400">
                  Dental chart placeholder
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    Save & complete
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}