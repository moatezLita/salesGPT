// services/axios/instance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://54.38.189.103:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.config.url, error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;