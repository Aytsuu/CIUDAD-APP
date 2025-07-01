import axios from 'axios';
import { Buffer } from 'buffer';

const baseURL = 'http://192.168.254.100:8000/';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(config => {
  console.log('Request:', config.method, config.url);
  return config;
});

// Payment API instance
const paymentApi = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptors for error handling
[api, paymentApi].forEach(instance => {
  instance.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      return Promise.reject(error);
    }
  );
});

export { api, paymentApi };