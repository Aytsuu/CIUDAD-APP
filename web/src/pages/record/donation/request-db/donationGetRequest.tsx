import {api} from "@/api/api";

export const getdonationreq = async () => {
    try {
        const res = await api.get('donation/donation-record/');
        
        // Handle empty/undefined responses
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return [];  // Always return an array
    }
};

export const getPersonalList = async () => {
  try {
    const res = await api.get('donation/personal-list/');
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
};