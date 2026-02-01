import api from "./axios"

export const createAppointment = (data) => {
  return api.post("/appointments", data)
}

export const getMyAppointments = () => {
  return api.get("/appointments/patient/me")
}

export const getMyDoctorAppointments = () => {
  return api.get("/appointments/doctor/me")
}

export const updateAppointmentStatus = (id, status) => {
  return api.put(`/appointments/${id}`, { status })
}