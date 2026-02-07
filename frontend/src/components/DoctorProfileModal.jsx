import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getMyProfile, updateMyProfile } from "../api/auth";

export default function DoctorProfileModal({
  open,
  onClose,
  onSuccess,
  user, // Current user from auth context
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  // Load current profile data when modal opens
  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const res = await getMyProfile();
      reset({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        phone: res.data.phone || "",
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      // If profile loading fails, use current user data
      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateMyProfile(data);
      toast.success("Profile updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <Label>First Name</Label>
            <Input
              {...register("firstName", {
                required: "First name is required",
              })}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label>Last Name</Label>
            <Input
              {...register("lastName", {
                required: "Last name is required",
              })}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+\-\s()]*$/,
                  message:
                    "Phone number can only contain numbers, +, -, spaces, and parentheses",
                },
              })}
              placeholder="Enter your phone number"
              onKeyPress={(e) => {
                // Allow numbers, +, -, space, and parentheses
                const regex = /[0-9+\-\s()]/;
                if (
                  !regex.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete"
                ) {
                  e.preventDefault();
                }
              }}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
