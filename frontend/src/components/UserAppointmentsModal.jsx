import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  getUserAppointments,
  updateAppointment,
  deleteAppointment,
} from "../api/appointment";

const statusStyles = {
  PENDING: "border border-yellow-400 text-yellow-700 bg-yellow-50",
  CONFIRMED: "border border-blue-400 text-blue-700 bg-blue-50",
  COMPLETED: "border border-green-400 text-green-700 bg-green-50",
  CANCELLED: "border border-red-400 text-red-700 bg-red-50",
};

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function UserAppointmentsModal({ open, user, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    status: "",
    notes: "",
  });

  // Load appointments for the user
  const loadAppointments = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await getUserAppointments(user.id);
      setAppointments(res.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadAppointments();
    }
  }, [open, user]);

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setEditForm({
      date: new Date(appointment.date).toISOString().slice(0, 16), // Format for datetime-local input
      status: appointment.status,
      notes: appointment.notes || "",
    });
  };

  // Handle save appointment changes
  const handleSaveAppointment = async () => {
    if (!editingAppointment) return;

    try {
      // Ensure date is properly formatted as ISO string and time ends with :00
      let appointmentDate = new Date(editForm.date);
      // Force minutes to be 00
      appointmentDate.setMinutes(0);
      appointmentDate.setSeconds(0);
      appointmentDate.setMilliseconds(0);

      const updateData = {
        date: appointmentDate.toISOString(),
        status: editForm.status,
        notes: editForm.notes,
      };

      await updateAppointment(editingAppointment.id, updateData);

      toast.success("Appointment updated successfully");
      setEditingAppointment(null);
      loadAppointments(); // Reload appointments
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditForm({
      date: "",
      status: "",
      notes: "",
    });
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      loadAppointments(); // Reload appointments
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Appointments for{" "}
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.email}
          </h2>
          <Button variant="outline" onClick={onClose}>
            ×
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-slate-500">Loading appointments...</p>
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">
              No appointments found for this user.
            </p>
          </div>
        )}

        {!loading && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  {editingAppointment?.id === appointment.id ? (
                    // Edit form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="date">Date & Time</Label>
                          <Input
                            id="date"
                            type="datetime-local"
                            value={editForm.date}
                            step="3600"
                            onChange={(e) =>
                              setEditForm({ ...editForm, date: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            value={editForm.status}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="w-full border rounded-md px-3 py-2"
                          >
                            {APPOINTMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:col-span-1">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            value={editForm.notes}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Appointment notes..."
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSaveAppointment}>
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display appointment
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">
                            {new Date(appointment.date).toLocaleDateString()} •{" "}
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded font-medium ${
                              statusStyles[appointment.status]
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600">
                          Doctor:{" "}
                          {appointment.doctor?.firstName &&
                          appointment.doctor?.lastName
                            ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                            : (appointment.doctor?.email ?? "—")}
                        </p>

                        {appointment.notes && (
                          <p className="text-sm text-slate-600">
                            Notes: {appointment.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleDeleteAppointment(appointment.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
