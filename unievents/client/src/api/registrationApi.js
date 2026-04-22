import { apiClient } from "./client";

export const registrationApi = {
  check(email, eventId) {
    const searchParams = new URLSearchParams({ email, eventId });
    return apiClient.get(`/check-registration?${searchParams.toString()}`);
  },
  create(payload) {
    return apiClient.post("/register", payload);
  },
};
