import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://payae-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let failedRequests = 0;

api.interceptors.response.use(
  (response) => {
    failedRequests = 0;
    return response;
  },
  (error) => {
    if (!error.response || error.response.status === 502 || error.response.status === 503) {
      failedRequests++;
      if (failedRequests >= 2) {
        window.location.reload(); 
      }
    }

    const isAuthRoute = error.config?.url?.includes('/auth/');
    if (error.response && error.response.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;