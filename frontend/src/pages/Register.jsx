import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { registerUser } from "../api/auth"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

export default function Register() {
  const { register, handleSubmit, setValue } = useForm()

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success("Account created. You can login now.")
    } catch (err) {
      toast.error(err.response?.data?.error || "Register failed")
    }
  }

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
              <Link to="/login" className="underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}