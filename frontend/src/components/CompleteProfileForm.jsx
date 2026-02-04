import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMyProfile } from "../api/patient";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function CompleteProfileForm({
  onSuccess,
  initialValues = null,
  onCancel,
  submitAction = null,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // ✅ RESET ONLY ON MOUNT
  useEffect(() => {
    if (!initialValues) return;

    reset({
      firstName: initialValues.user?.firstName || "",
      lastName: initialValues.user?.lastName || "",
      phone: initialValues.phone || "",
      dateOfBirth: initialValues.dateOfBirth
        ? initialValues.dateOfBirth.split("T")[0]
        : "",
    });
  }, []); // ❗ EMPTY deps on purpose

  const onSubmit = async (data) => {
    try {
      const action = submitAction || createMyProfile;
      const res = await action(data);
      toast.success(initialValues ? "Profile updated" : "Profile completed");
      onSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save profile");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <Label>First name</Label>
        <Input
          {...register("firstName", { required: "First name is required" })}
        />
        {errors.firstName && (
          <p className="text-xs text-red-500">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Label>Last name</Label>
        <Input
          {...register("lastName", { required: "Last name is required" })}
        />
        {errors.lastName && (
          <p className="text-xs text-red-500">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          {...register("phone", {
            required: "Phone is required",
            pattern: { value: /^[0-9]+$/, message: "Numbers only" },
          })}
          inputMode="numeric"
        />
        {errors.phone && (
          <p className="text-xs text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label>Date of birth</Label>
        <Input
          type="date"
          {...register("dateOfBirth", {
            validate: (v) =>
              !v || new Date(v) < new Date() ? true : "Must be in the past",
          })}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {initialValues ? "Save changes" : "Save profile"}
        </Button>

        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
