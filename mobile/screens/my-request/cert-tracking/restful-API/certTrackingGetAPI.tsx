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

export const cancelCertificate = async (cr_id: string) => {
  const res = await api.post(`clerk/certificate/${cr_id}/cancel/`, {});
  return res.data;
};


