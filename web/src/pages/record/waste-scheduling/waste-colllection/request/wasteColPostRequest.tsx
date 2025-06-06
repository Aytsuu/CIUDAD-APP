import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const wasteColData = async (collectionInfo: Record<string, any>) => {
    try {
        console.log({
            wc_date: formatDate(collectionInfo.date),
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions,
            wc_is_archive: false,
            staff_id: collectionInfo.staff_id

        });

        const res = await api.post('waste/waste-collection-sched/', {
            wc_date: formatDate(collectionInfo.date),
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions,
            wc_is_archive: false,
            staff_id: collectionInfo.staff_id
        });

        return res.data.wc_num;
    } catch (err) {
        console.error("Error creating waste schedule:", err);
        throw err;
    }
};



export const wasteAssData = async (assInfo: Record<string, any>) => {
    try {
        console.log({
            sitio_id: assInfo.sitio_id,
            wstp_id: assInfo.wstp_id,
            wc_num: assInfo.wc_num,
            truck_id: assInfo.truck_id,
            staff_id: assInfo.staff_id  
        });

        const res = await api.post('waste/waste-collection-assignment/', {
            wc_num: assInfo.wc_num,
            sitio_id: assInfo.sitio_id,
            wstp_id: assInfo.wstp_id,
            truck_id: assInfo.collectionTruck,
            staff_id: assInfo.staff_id
        });

        return res.data.was_id;
    } catch (err) {
        console.error("Error creating waste collection assignment:", err);
        throw err;
    }
};