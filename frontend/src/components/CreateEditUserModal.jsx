import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

export default function CreateEditUserModal({
  open,
  onClose,
  onSuccess,
  user, // ✅ renamed to match AdminDashboard
  onSubmitAction,
}) {
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: "PATIENT",
    },
  });

  /* =====================
     Sync form when user changes
  ===================== */
  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        role: user.role?.name || "PATIENT",
      });
    } else {
      reset({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        phone: "",
        role: "PATIENT",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await onSubmitAction(data);
      toast.success(isEdit ? "User updated" : "User created");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit user" : "Create user"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              {...register("email", { required: true })}
              disabled={isEdit}
            />
          </div>

          {/* First Name */}
          <div>
            <Label>First Name</Label>
            <Input {...register("firstName")} placeholder="Enter first name" />
          </div>

          {/* Last Name */}
          <div>
            <Label>Last Name</Label>
            <Input {...register("lastName")} placeholder="Enter last name" />
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} placeholder="Enter phone number" />
          </div>

          {/* Password (only when creating) */}
          {!isEdit && (
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                {...register("password", { required: true })}
              />
            </div>
          )}

          {/* Role */}
          <div>
            <Label>Role</Label>

            {/* hidden register so RHF tracks role */}
            <input type="hidden" {...register("role", { required: true })} />

            <Select
              value={watch("role")}
              onValueChange={(value) => setValue("role", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PATIENT">Patient</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Save changes" : "Create user"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
