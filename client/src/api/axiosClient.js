// Determine API URL from environment or dynamic window hostname for LAN testing
const getApiBaseUrl = () => {
  const customUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (customUrl) {
    return customUrl.endsWith('/api') ? customUrl : `${customUrl}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dineflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
