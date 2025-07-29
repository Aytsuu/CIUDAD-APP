import { api } from '@/api/api';

api.interceptors.request.use(config => {
  console.log('Request:', config.method, config.url);
  return config;
});

api.interceptors.response.use(
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

export const paymentApi = api;