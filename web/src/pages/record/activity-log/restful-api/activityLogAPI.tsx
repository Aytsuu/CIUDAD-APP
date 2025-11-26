import { api } from '@/api/api';
import { AxiosError } from 'axios';
import { ActivityLogResponse } from '../queries/ActlogQueries';

// Fetch activity logs with search and pagination
export const getActivityLogs = async (search?: string, page?: number, pageSize?: number, actType?: string): Promise<ActivityLogResponse> => {
  try {
    const params = new URLSearchParams();
    if (search) {
      params.append('search', search);
    }
    if (page) {
      params.append('page', page.toString());
    }
    if (pageSize) {
      params.append('page_size', pageSize.toString());
    }
    if (actType) {
      params.append('act_type', actType);
    }
    
    const queryString = params.toString();
    const url = `/api/activity-log/${queryString ? '?' + queryString : ''}`;
    
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    throw error;
  }
};

// Legacy function for backward compatibility
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