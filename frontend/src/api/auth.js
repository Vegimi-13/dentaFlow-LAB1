import api from "./axios";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

// Profile management
export const getMyProfile = () => api.get("/auth/profile");
export const updateMyProfile = (data) => api.put("/auth/profile", data);
