import { api } from '@/api/api';
import { formatDate } from '@/helpers/dateFormatter';

// export const wasteColData = async (collectionInfo: Record<string, any>) => {
//     try {
//         console.log({
//             wc_date: formatDate(collectionInfo.date),
//             wc_time: collectionInfo.time,
//             wc_add_info: collectionInfo.additionalInstructions,
//             wc_is_archive: false,
//             staff_id: collectionInfo.staff_id

//         });

//         const res = await api.post('waste/waste-collection-sched/', {
//             wc_date: formatDate(collectionInfo.date),
//             wc_time: collectionInfo.time,
//             wc_add_info: collectionInfo.additionalInstructions,
//             wc_is_archive: false,
//             staff_id: collectionInfo.staff_id
//         });

//         return res.data.wc_num;
//     } catch (err) {
//         console.error("Error creating waste schedule:", err);
//         throw err;
//     }
// };


export const wasteColData = async (collectionInfo: Record<string, any>) => {
    try {
        console.log({
            wc_date: formatDate(collectionInfo.date),
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions,
            wc_is_archive: false,
            staff: '00005250722',
            staff: '00005250722',
            sitio: collectionInfo.selectedSitios,
            truck: collectionInfo.collectionTruck,
            wstp: collectionInfo.driver  // Store driver directly here
        });

        const res = await api.post('waste/waste-collection-sched/', {
            wc_date: formatDate(collectionInfo.date),
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions || "None",
            wc_is_archive: false,
            staff: '00005250722',
            staff: '00005250722',
            sitio: collectionInfo.selectedSitios,
            truck: collectionInfo.collectionTruck,
            wstp: collectionInfo.driver  // Store driver directly here
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
            wc_num: assInfo.wc_num,
            sitio_id: assInfo.sitio_id,
            wstp_id: assInfo.wstp_id,
            truck_id: parseInt(assInfo.truck_id),
            staff_id: '00005250722'
        });

        const res = await api.post('waste/waste-collection-assignment/', {
            wc_num: assInfo.wc_num,
            sitio: assInfo.sitio_id,
            wstp: assInfo.wstp_id,
            truck: parseInt(assInfo.truck_id),
            staff_id: '00005250722'
        });

        return res.data.was_id;
    } catch (err) {
        console.error("Error creating waste collection assignment:", err);
        throw err;
    }
};




//Assign Collectors
// export const addAssCollector = async (assCollInfo: Record<string, any>) => {
//     try {
//         console.log({
//             was: assCollInfo.was_id,
//             wstp: assCollInfo.wstp_id  
//         });

//         const res = await api.post('waste/waste-ass-collectors/', {
//             was: assCollInfo.was_id,
//             wstp: assCollInfo.wstp_id
//         });

//         return res.data.wasc_id;
//     } catch (err) {
//         console.error("Error creating waste collection assignment:", err);
//         throw err;
//     }
// }

export const addAssCollector = async (wc_num: number, wstp_id: string) => {
    try {
        const res = await api.post('waste/waste-ass-collectors/', {
            wc_num: wc_num,
            wstp: wstp_id
        });
        return res.data.wasc_id;
    } catch (err) {
        console.error("Error assigning collector:", err);
        throw err;
    }
}