import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { registerUser } from "../api/auth";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Register() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");

  const watchPassword = watch("password");
  const watchConfirmPassword = watch("confirmPassword");

  // Real-time password validation
  useEffect(() => {
    if (watchPassword && watchConfirmPassword) {
      if (watchPassword !== watchConfirmPassword) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [watchPassword, watchConfirmPassword]);

  const onSubmit = async (data) => {
    // Final check if passwords match (in case user submits quickly)
    if (data.password !== data.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      // Remove confirmPassword from data before sending to API
      const { confirmPassword, ...submitData } = data;
      await registerUser(submitData);
      toast.success("Account created. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500); // Give time for the user to see the success message
    } catch (err) {
      toast.error(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input {...register("email")} type="email" required />
            </div>

            <div>
              <Label>Password</Label>
              <Input {...register("password")} type="password" required />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                {...register("confirmPassword")}
                type="password"
                required
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <div>
              <Label>Role</Label>
              <Select onValueChange={(v) => setValue("role", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PATIENT">Patient</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">Register</Button>

            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
