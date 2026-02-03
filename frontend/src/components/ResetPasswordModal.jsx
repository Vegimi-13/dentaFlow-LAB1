import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function ResetPasswordModal({
  open,
  onClose,
  user,
  onSuccess,
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/admin/users/${user.id}/reset-password`, {
        newPassword: password,
      });

      toast.success("Password reset successfully");
      onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Reset password for{" "}
            <strong>{user.email}</strong>
          </p>

          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleReset} disabled={loading}>
              Reset password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}