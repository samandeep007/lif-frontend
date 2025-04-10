import axios from 'axios';
import { getItemAsync } from '../utils/secureStore';

const api = axios.create({
  baseURL: 'https://lif-backend-awv3.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token from SecureStore:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;