import { api } from "@/api/api";
import { GarbageRequest } from "../queries/GarbageRequestFetchQueries";

export const getDrivers = async () => {
    try {
        const res = await api.get('waste/waste-drivers/');
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getTrucks = async () => {
    try {
        const res = await api.get('waste/waste-trucks/');
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getCollectors = async () => {
    try{
        const res = await api.get('waste/waste-collectors/');
        return res.data
    } catch(err){
        console.error(err)
        throw err;
    }
}

export const getGarbagePendingRequest = async () => {
    try {
        const { data } = await api.get('waste/garbage-pickup-request/', {
            params: {
                status: "pending"
            }
        });

        return data.map((item: any) => ({   
            garb_id: item.garb_id,
            garb_requester: item.garb_requester || '',
            garb_location: item.garb_location,
            garb_waste_type: item.garb_waste_type,
            garb_pref_date: item.garb_pref_date,
            garb_pref_time: item.garb_pref_time,
            garb_created_at: item.garb_created_at,
            garb_additional_notes: item.garb_additional_notes,
            file_id: item.file?.file_url || '',

        }));
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return [];
    }
}