import { api } from '@/api/api';

export const getAllActivityLogs = async () => {
  const response = await api.get('/api/activity-log/');
  return response.data;
};

export const getActivityLogById = async (id: number) => {
  const response = await api.get(`/api/activity-log/${id}/`);
  return response.data;
};

export const createActivityLog = async (data: any) => {
  const response = await api.post('/api/activity-log/', data);
  return response.data;
}; 