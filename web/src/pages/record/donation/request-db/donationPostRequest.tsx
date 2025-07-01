<<<<<<< HEAD
import { api } from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';
=======
import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateHelper';
>>>>>>> mobile-register

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