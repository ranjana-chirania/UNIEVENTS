import { apiClient } from "./client";

export const eventsApi = {
  getAll() {
    return apiClient.get("/events");
  },
  getById(eventId) {
    return apiClient.get(`/events/${eventId}`);
  },
  create(payload) {
    return apiClient.post("/events", payload);
  },
  remove(eventId) {
    return apiClient.delete(`/events/${eventId}`);
  },
  getRegistrations(eventId) {
    return apiClient.get(`/admin/event/${eventId}/registrations`);
  },
};
