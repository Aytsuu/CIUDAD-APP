import { api } from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const putdonationreq = async (don_num: number, donationInfo: Record<string, any>) => {
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