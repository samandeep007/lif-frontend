import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    // We'll add token retrieval logic in a later chunk
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;