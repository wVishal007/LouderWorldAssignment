import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.error("❌ VITE_API_URL is not defined");
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔥 REQUIRED for Passport sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

/* ============================
   🔐 AUTH APIs
============================ */
export const authAPI = {
  login: () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  logout: () => api.post("/auth/logout"),

  getUser: () => api.get("/auth/user"),
};

/* ============================
   🌍 PUBLIC EVENTS
============================ */
export const eventsAPI = {
  getPublicEvents: (params) =>
    api.get("/api/events", { params }),

  getEventById: (id) =>
    api.get(`/api/events/${id}`),
};

/* ============================
   🔐 DASHBOARD EVENTS
============================ */
export const dashboardAPI = {
  getEvents: (params) =>
    api.get("/api/events/dashboard", { params }),

  importEvent: (eventId, data) =>
    api.post(`/api/events/${eventId}/import`, data),

  getStats: () =>
    api.get("/api/events/stats/overview"),

  bulkUpdateStatus: (eventIds, status) =>
    api.post("/api/events/bulk-status", { eventIds, status }),

  markAsInactive: (id) =>
    api.put(`/api/events/${id}/inactive`),
};

/* ============================
   🕷 SCRAPER APIs
============================ */
export const scraperAPI = {
  createEvent: (data) =>
    api.post("/api/events/create", data),

  updateEvent: (id, data) =>
    api.put(`/api/events/update/${id}`, data),
};

/* ============================
   📊 SCRAPE LOGS
============================ */
export const scrapeLogAPI = {
  getLogs: (params) =>
    api.get("/api/scrape-logs", { params }),

  createLog: (data) =>
    api.post("/api/scrape-logs", data),
};

/* ============================
   📧 LEADS APIs
============================ */
export const leadsAPI = {
  create: (data) =>
    api.post("/api/leads", data),
};
