import { api } from "@/api/api";


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
        const { data } = await api.get('waste/garbage-pickup-request-pending/', {
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

export const getGarbageRejectedRequest = async () => {
    try {
        const { data } = await api.get('waste/garbage-pickup-request-rejected/', {
            params: {
                status: "rejected"
            }
        });

        return data.map((item: any) => ({
            garb_id: item.garb_id || '', 
            garb_requester: item.garb_requester || '',
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            garb_created_at: item.garb_created_at || '',
            dec_id: item.dec_id || null, 
            dec_date: item.dec_date || null,
            dec_reason: item.dec_reason || '',
        }));
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return [];
    }
}

export const getGarbageAcceptedRequest = async () => {
    try {
        const { data } = await api.get('waste/garbage-pickup-request-accepted/', {
            params: {
                status: "accepted"
            }
        });

        return data.map((item: any) => ({
            garb_id: item.garb_id || '', 
            garb_requester: item.garb_requester || '',
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            garb_created_at: item.garb_created_at || '',
            dec_id: item.dec_id || null, 
            dec_date: item.dec_date || null,
        }));
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return [];
    }
}