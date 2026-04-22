import { apiClient } from "./client";

export const aiApi = {
  generateEventDescription(payload) {
    return apiClient.post("/ai/generate-event-description", payload);
  },
};
