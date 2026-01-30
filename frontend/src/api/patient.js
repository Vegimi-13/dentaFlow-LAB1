import api from "./axios"

export const getMyProfile = () => {
  return api.get("/patients/me")
}

export const createMyProfile = (data) => api.post("/patients/me", data)
export const updateMyProfile = (data) => api.put("/patients/me", data)