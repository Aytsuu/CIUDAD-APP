import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token'); // Consistent key name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for 401 (Unauthorized) and avoid infinite retries
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Use the SAME Axios instance (not global `axios`) to avoid baseURL issues
        const refreshResponse = await api.post('/api/token/refresh/', {
          refresh: refreshToken,
        });

        // Update tokens (use same key names consistently)
        localStorage.setItem('access_token', refreshResponse.data.access);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login'; // Replace with your login route
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;