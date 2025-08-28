import { api } from "@/api/api";


const toList = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const getPersonalCertifications = async (residentId: string) => {
  const res = await api.get(`clerk/certificate/?rp=${residentId}`);
  return toList(res.data);
};

export const getBusinessPermitRequests = async (residentId: string) => {
  const res = await api.get(`clerk/business-permit/?rp=${residentId}`);
  return toList(res.data);
};


