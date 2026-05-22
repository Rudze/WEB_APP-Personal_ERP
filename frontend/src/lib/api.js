import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (original.url?.includes("/auth/refresh") || original.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh");
        processQueue(null);
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError);
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export const publicApi = {
  getConfig: () => api.get("/public/config"),
};

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const usersApi = {
  list: () => api.get("/users"),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const adminApi = {
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),
};

export const dashboardsApi = {
  list: () => api.get("/dashboards"),
  get: (slug) => api.get(`/dashboards/${slug}`),
  create: (data) => api.post("/dashboards", data),
  update: (id, data) => api.put(`/dashboards/${id}`, data),
  delete: (id) => api.delete(`/dashboards/${id}`),
  updateLayout: (id, layout) => api.put(`/dashboards/${id}/layout`, { layout }),
  addWidget: (id, data) => api.post(`/dashboards/${id}/widgets`, data),
  updateWidget: (id, data) => api.put(`/dashboards/widgets/${id}`, data),
  deleteWidget: (id) => api.delete(`/dashboards/widgets/${id}`),
};

export const wikiApi = {
  list: () => api.get("/wiki"),
  search: (q) => api.get("/wiki/search", { params: { q } }),
  get: (slug) => api.get(`/wiki/${slug}`),
  create: (data) => api.post("/wiki", data),
  update: (id, data) => api.put(`/wiki/${id}`, data),
  delete: (id) => api.delete(`/wiki/${id}`),
  getVersions: (id) => api.get(`/wiki/${id}/versions`),
  getVersion: (id, versionId) => api.get(`/wiki/${id}/versions/${versionId}`),
};

export const cvApi = {
  get: () => api.get("/cv"),
  updateProfile: (data) => api.put("/cv/profile", data),
  createFormation: (data) => api.post("/cv/formations", data),
  updateFormation: (id, data) => api.put(`/cv/formations/${id}`, data),
  deleteFormation: (id) => api.delete(`/cv/formations/${id}`),
};

export const portfolioApi = {
  list: () => api.get("/portfolio"),
  get: (slug) => api.get(`/portfolio/${slug}`),
  create: (data) => api.post("/portfolio", data),
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  delete: (id) => api.delete(`/portfolio/${id}`),
};
