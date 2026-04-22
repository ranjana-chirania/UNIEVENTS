import { apiClient } from "./client";

export const authApi = {
  login(payload) {
    return apiClient.post("/login", payload);
  },
  register(payload) {
    return apiClient.post("/register-user", payload);
  },
};
