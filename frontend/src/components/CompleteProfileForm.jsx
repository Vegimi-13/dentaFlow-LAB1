import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMyProfile } from "../api/patient";
import { toast } from "react-toastify";
import React from "react";

export default function CompleteProfileForm({
  onSuccess,
  initialValues = null,
  onCancel,
  submitAction = null,
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialValues || {},
  });

  React.useEffect(() => {
    reset(initialValues || {});
  }, [initialValues]);

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
        <Input {...register("firstName", { required: true })} />
      </div>

      <div>
        <Label>Last name</Label>
        <Input {...register("lastName", { required: true })} />
      </div>

      <div>
        <Label>Phone</Label>
        <Input {...register("phone")} />
      </div>

      <div>
        <Label>Date of birth</Label>
        <Input type="date" {...register("dateOfBirth")} />
      </div>

      <div className="flex gap-2 mt-2">
        <Button type="submit">
          {initialValues ? "Save changes" : "Save profile"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset(initialValues || {});
              onCancel();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
