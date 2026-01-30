import api from "./axios"

export const createAppointment = (data) => {
  return api.post("/appointments", data)
}

export const getMyAppointments = () => {
  return api.get("/appointments/patient/me")
}