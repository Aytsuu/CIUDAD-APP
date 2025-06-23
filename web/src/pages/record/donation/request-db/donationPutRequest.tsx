import { api } from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const putdonationreq = async (don_num: number, donationInfo: Record<string, any>) => {
    try{
        const res = await api.put(`donation/donation-record/${don_num}/`, {
            don_num: donationInfo.don_num,
            don_donorfname: donationInfo.don_donorfname,
            don_donorlname: donationInfo.don_donorlname,
            don_item_name: donationInfo.don_item_name,
            don_qty: parseInt(donationInfo.don_qty),
            don_description: donationInfo.don_description,
            don_category: donationInfo.don_category,
            don_receiver: donationInfo.don_receiver,
            don_date: formatDate(donationInfo.don_date), // Use the formatted date
            // ra_id,
            // feat_id,
        });

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}
