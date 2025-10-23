import { api } from "@/api/api";


export const updateWasteColData = async (wc_num: number, collectionInfo: Record<string, any>) => {
    try {
        console.log("COLLECTION EDITTT",{
            wc_day: collectionInfo.day,
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions,
            sitio: collectionInfo.selectedSitios,
            truck: collectionInfo.collectionTruck,
            wstp: collectionInfo.driver,
            staff: collectionInfo.staff
        });

        const res = await api.put(`waste/waste-collection-sched/${wc_num}/`, {
            wc_day: collectionInfo.day,
            wc_time: collectionInfo.time,
            wc_add_info: collectionInfo.additionalInstructions,
            sitio: collectionInfo.selectedSitios,
            truck: collectionInfo.collectionTruck,
            wstp: collectionInfo.driver,
            staff: collectionInfo.staff            
        });
        return res.data;
    } catch (err) {
        console.error("Error updating waste schedule:", err);
        throw err;
    }
};  