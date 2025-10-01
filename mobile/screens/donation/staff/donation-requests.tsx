import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelpers";

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

export const getPersonalList = async () => {
  try {
    const res = await api.get('donation/personal-list/');
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
};

export const postdonationreq= async (donationInfo: Record<string, any>) => {
    try {
        const res = await api.post('donation/donation-record/', {
            don_num: donationInfo.don_num,
            don_donor: donationInfo.don_donor,
            don_item_name: donationInfo.don_item_name,
            don_qty: donationInfo.don_qty,
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_date: formatDate(donationInfo.don_date), 
            don_status: donationInfo.don_status,
        });

        return res.data.don_num;
    } catch (err) {
        console.error(err);
    }
};

export const putdonationreq = async (don_num: string, donationInfo: Record<string, any>) => {
    try{
        const res = await api.put(`donation/donation-record/${don_num}/`, {
            don_num: donationInfo.don_num,
            don_donor: donationInfo.don_donor,
            don_item_name: donationInfo.don_item_name,
            don_qty: donationInfo.don_qty,
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_date: formatDate(donationInfo.don_date),
            don_status: donationInfo.don_status,
        });

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}