import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "../api/auth";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data) => {
    try {
      const res = await loginUser(data);
      login(res.data.accessToken);

      const role = jwtDecode(res.data.accessToken).role;

      if (role === "PATIENT") navigate("/patient");
      if (role === "DOCTOR") navigate("/doctor");
      if (role === "ADMIN") navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
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

            <Button className="w-full">Login</Button>

            <p className="text-sm text-center text-gray-500">
              Don’t have an account?{" "}
              <Link to="/register" className="underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
