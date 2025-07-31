import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelpers";

export const getdonationreq = async () => {
    try {
        const res = await api.get('donation/donation-record/');
        
        // Handle empty/undefined responses
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error:", err);
        return [];  // Always return an array
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

        console.log({
            don_num: donationInfo.don_num,
            don_donor: donationInfo.don_donor,
            don_item_name: donationInfo.don_item_name,
            don_qty: donationInfo.don_qty,
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_date: formatDate(donationInfo.don_date),  
        });

        const res = await api.post('donation/donation-record/', {
            don_num: donationInfo.don_num,
            don_donor: donationInfo.don_donor,
            don_item_name: donationInfo.don_item_name,
            don_qty: donationInfo.don_qty,
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_date: formatDate(donationInfo.don_date), 
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
            don_date: formatDate(donationInfo.don_date), // Use the formatted date
        });

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}
