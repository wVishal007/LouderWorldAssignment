import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // REQUIRED for Passport sessions
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
   🌍 PUBLIC EVENTS (Website)
============================ */
export const eventsAPI = {
  // GET /api/events?city=&search=
  getPublicEvents: (params) =>
    api.get("/api/events", { params }),

  // GET /api/events/:id
  getEventById: (id) =>
    api.get(`/api/events/${id}`),
};

/* ============================
   🔐 DASHBOARD EVENTS (Admin)
============================ */
export const dashboardAPI = {
  // GET /api/events/dashboard?city=&status=&search=&startDate=&endDate=
  getEvents: (params) =>
    api.get("/api/events/dashboard", { params }),

  // POST /api/events/:id/import
  importEvent: (eventId, data) =>
    api.post(`/api/events/${eventId}/import`, data),

  // GET /api/events/stats/overview
  getStats: () =>
    api.get("/api/events/stats/overview"),

  // POST /api/events/bulk-status
  bulkUpdateStatus: (eventIds, status) =>
    api.post("/api/events/bulk-status", { eventIds, status }),

  // PUT /api/events/:id/inactive
  markAsInactive: (id) =>
    api.put(`/api/events/${id}/inactive`),
};

/* ============================
   🕷 SCRAPER APIs
============================ */
export const scraperAPI = {
  // POST /api/events/create
  createEvent: (data) =>
    api.post("/api/events/create", data),

  // PUT /api/events/update/:id
  updateEvent: (id, data) =>
    api.put(`/api/events/update/${id}`, data),
};

/* ============================
   📊 SCRAPE LOGS
============================ */
export const scrapeLogAPI = {
  // GET /api/scrape-logs
  getLogs: (params) =>
    api.get("/api/scrape-logs", { params }),

  // POST /api/scrape-logs
  createLog: (data) =>
    api.post("/api/scrape-logs", data),
};

/* ============================
   📧 LEADS APIs
============================ */
export const leadsAPI = {
  // POST /api/leads
  create: (data) =>
    api.post("/api/leads", data),
};