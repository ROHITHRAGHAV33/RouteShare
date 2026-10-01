import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rs_token");
      localStorage.removeItem("rs_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  if (error?.code === "ERR_NETWORK" || (!error?.response && error?.request)) {
    return "Cannot connect to server. Please verify backend is running on http://localhost:8000.";
  }
  const detail = error?.response?.data?.detail;
  if (!detail) {
    if (error?.response?.status === 502 || error?.response?.status === 504) {
      return "Backend server is offline. Please start FastAPI (python -m uvicorn app.main:app --port 8000).";
    }
    return error?.message || "Something went wrong. Please try again.";
  }
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.message || d.msg || `${d.loc?.join(".")}: ${d.type}`).join(" · ");
  }
  return "Something went wrong. Please try again.";
}

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  providers: () => api.get("/auth/providers"),
};

export const vehiclesApi = {
  create: (payload) => api.post("/vehicles", payload),
  mine: () => api.get("/vehicles/my"),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

export const routesApi = {
  create: (payload) => api.post("/routes", payload),
  mine: () => api.get("/routes/my"),
  get: (id) => api.get(`/routes/${id}`),
  update: (id, payload) => api.put(`/routes/${id}`, payload),
  remove: (id) => api.delete(`/routes/${id}`),
  assignDriver: (id, driverId) => api.patch(`/routes/${id}/assign-driver`, { driver_id: driverId }),
  availableDrivers: () => api.get("/routes/available-drivers"),
};

export const searchApi = {
  search: (params) => api.get("/search", { params }),
};

export const bookingsApi = {
  create: (payload) => api.post("/bookings", payload),
  mine: () => api.get("/bookings/my"),
  providerBookings: () => api.get("/bookings/provider"),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  downloadInvoice: (id) => api.get(`/bookings/${id}/invoice`, { responseType: "blob" }),
};

export const driverApi = {
  profile: () => api.get("/driver/profile"),
  updateProfile: (payload) => api.put("/driver/profile", payload),
  providers: () => api.get("/driver/providers"),
  trips: () => api.get("/driver/trips"),
  tripBookings: (routeId) => api.get(`/driver/trips/${routeId}/bookings`),
  confirmPickup: (bookingId) => api.patch(`/driver/bookings/${bookingId}/pickup`),
  confirmDelivery: (bookingId) => api.patch(`/driver/bookings/${bookingId}/deliver`),
  completeTrip: (routeId) => api.patch(`/driver/trips/${routeId}/complete`),
};

export const adminApi = {
  users: (params) => api.get("/admin/users", { params }),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  routes: (params) => api.get("/admin/routes", { params }),
  bookings: (params) => api.get("/admin/bookings", { params }),
  summary: () => api.get("/admin/reports/summary"),
};

export default api;
