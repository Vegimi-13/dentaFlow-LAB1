import api from "./axios";

export const getAllUsers = () => {
  return api.get("/admin/users");
};

export const createUser = (data) => {
  return api.post("/admin/users", data);
};

export const updateUser = (id, data) => {
  return api.put(`/admin/users/${id}`, data);
};

export const deleteUser = (id) => {
  return api.delete(`/admin/users/${id}`);
};