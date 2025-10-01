import {api} from "@/api/api";

export const getdonationreq = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  category?: string,
  status?: string
): Promise<{ results: any[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize
    };
    
    if (searchQuery) params.search = searchQuery;
    if (category && category !== 'all') params.category = category;
    if (status && status !== 'all') params.status = status;
    
    const res = await api.get('donation/donation-record/', { params });
    
    // Handle paginated response
    if (res.data.results !== undefined) {
      return {
        results: res.data.results || [],
        count: res.data.count || 0
      };
    }
    
    // Fallback for non-paginated response
    const data = res.data?.data ?? res.data ?? [];
    return {
      results: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0
    };
  } catch (err) {
    return { results: [], count: 0 };
  }
};

export const getDonationById = async (don_num: string) => {
  try {
    const res = await api.get(`donation/donation-record/${don_num}/`);
    return res.data;
  } catch (err) {
    throw new Error(`Failed to fetch donation ${don_num}`);
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