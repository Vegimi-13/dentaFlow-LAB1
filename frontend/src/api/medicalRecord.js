import api from "./axios";

export const getMyMedicalRecords = () => {
  return api.get("/records/me");
};

