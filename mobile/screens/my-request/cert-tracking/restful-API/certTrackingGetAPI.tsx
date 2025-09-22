import { api } from "@/api/api";


const toList = (data: any) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const getPersonalCertifications = async (residentId: string) => {
  // Fetch from multiple clerical endpoints, combine, then filter by resident and status
  try {
    const [certRes, personalRes] = await Promise.all([
      api.get(`clerk/certificate/`, { params: { page_size: 1000 } }).catch(() => ({ data: [] })),
      api.get(`clerk/personal-clearances/`, { params: { page_size: 1000 } }).catch(() => ({ data: [] })),
    ]);
    const combined = [...toList(certRes.data), ...toList(personalRes.data)];
    const resident = String(residentId).trim();
    const list = combined.filter((item: any) => {
      const rpCandidates = [item?.rp_id, item?.rp, item?.resident_id, item?.requester]
        .map((v: any) => (v == null ? '' : String(v))).map((s: string) => s.trim());
      const matchesResident = rpCandidates.includes(resident);
      const status = (item?.cr_req_status ?? '').toString().toLowerCase();
      const isPending = status === 'pending';
      return matchesResident && isPending;
    });
    try {
      console.log('[CertTracking API] personal fetched count (filtered):', list.length);
      console.log('[CertTracking API] personal sample:', JSON.stringify(list.slice(0, 3)));
    } catch {}
    return list;
  } catch (_) {}
  return [];
};

export const getBusinessPermitRequests = async (residentId: string) => {
  try {
    const res = await api.get(`clerk/permit-clearances/`);
    // Filter client-side by rp/rp_id to show only user's requests
    const list = toList(res.data).filter((item: any) => {
      const rp = String(item?.rp_id ?? item?.rp ?? '').trim();
      return rp === String(residentId).trim();
    });
    try {
      console.log('[CertTracking API] business fetched count (filtered):', list.length);
      console.log('[CertTracking API] business sample:', JSON.stringify(list.slice(0, 3)));
    } catch {}
    return list;
  } catch (_) {}
  return [];
};

export const cancelCertificate = async (cr_id: string) => {
  const res = await api.post(`clerk/certificate/${cr_id}/cancel/`, {});
  return res.data;
};

export const cancelBusinessPermit = async (bpr_id: string) => {
  // Backend supports updating status via PUT to business-clearance
  const payload = {
    bpr_id,
    req_payment_status: 'Cancelled',
    req_date_completed: new Date().toISOString()
  };
  const res = await api.put(`clerk/business-clearance/`, payload);
  return res.data;
};


