const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? data.message
        : "Request failed";
    throw new Error(message);
  }

  return data;
}

export const apiClient = {
  get(path) {
    return request(path);
  },
  post(path, body, options = {}) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },
  delete(path, options = {}) {
    return request(path, {
      method: "DELETE",
      ...options,
    });
  },
};

export { API_BASE_URL };
