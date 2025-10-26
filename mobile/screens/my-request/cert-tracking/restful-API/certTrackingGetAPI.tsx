import { api } from "@/api/api";


const toList = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const getPersonalCertifications = async (residentId: string) => {
  // Primary endpoint
  const res = await api.get(`clerk/certificate/`, { params: { rp: residentId, rp_id: residentId } });
  let list = toList(res.data);
  if (list.length > 0) return list;

  // Fallbacks: some backends expose consolidated listing here
  try {
    const [residentRes] = await Promise.all([
      api.get(`clerk/personal-clearances/`),
      
    ]);
    const residentList = toList(residentRes.data);
   
    list = [...residentList];
  } catch (_) {
    // ignore and return what we have
  }
  return list;
};

export const getBusinessPermitRequests = async (residentId: string) => {
  const res = await api.get(`clerk/business-permit/`, { params: { rp: residentId, rp_id: residentId } });
  return toList(res.data);
};

export const cancelCertificate = async (cr_id: string) => {
  const res = await api.post(`clerk/certificate/${cr_id}/cancel/`, {});
  return res.data;
};

export const cancelBusinessPermit = async (bpr_id: string) => {
  const res = await api.post(`clerk/business-permit/${bpr_id}/cancel/`, {});
  return res.data;
};


