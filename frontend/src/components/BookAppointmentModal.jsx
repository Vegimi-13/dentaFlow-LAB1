import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import { createAppointment } from "../api/appointment";

// Simple v1 slots (later backend-driven)
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export default function BookAppointmentModal({ open, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !doctorId) {
      toast.error("Please select date, time and doctor");
      return;
    }

    try {
      setLoading(true);

      await createAppointment({
        date: `${selectedDate}T${selectedTime}`,
        doctorId: Number(doctorId),
        notes,
      });

      toast.success("Appointment requested");
      onSuccess?.();
      onClose();

      // reset state
      setSelectedDate("");
      setSelectedTime("");
      setDoctorId("");
      setNotes("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date + Time layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Time slots */}
            <div>
              <Label>Time</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`border rounded-md py-2 text-sm transition
                      ${
                        selectedTime === time
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-100"
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Doctor (temporary input – will become dropdown) */}
          <div>
            <Label>Doctor</Label>
            <Input
              placeholder="Doctor ID (temporary)"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Reason for visit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Requesting..." : "Request appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
