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
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''

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
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
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
            dec_date: item.dec_date || null,
            truck_id: item.truck_id || null,
            driver_id: item.driver_id || null,
            collector_ids: item.collector_ids || [],
            pickup_assignment_id: item.pickup_assignment_id || null,
            assignment_collector_ids: item.assignment_collector_ids || [],
            assignment_info: item.assignment_info ? {
                driver: item.assignment_info.driver || '',
                pick_time: item.assignment_info.pick_time || '',
                pick_date: item.assignment_info.pick_date || '',
                collectors: item.assignment_info.collectors || [],
                truck: item.assignment_info.truck || '',
            } : null,
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));

    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return [];
    }
}



export const getGarbageCompletedRequest = async () => {
    try {
        const { data } = await api.get('waste/garbage-pickup-request-completed/', {
            params: {
                status: "completed"
            }
        });

        return data.map((item: any) => ({
            garb_id: item.garb_id ?? 0,
            garb_requester: item.garb_requester ?? 'Unknown',
            garb_location: item.garb_location ?? '',
            garb_waste_type: item.garb_waste_type ?? '',
            garb_created_at: item.garb_created_at ?? '',
            conf_resident_conf_date: item.confirmation_info?.conf_resident_conf_date ?? null,
            conf_staff_conf_date: item.confirmation_info?.conf_staff_conf_date ?? null,
            conf_resident_conf: item.confirmation_info?.conf_resident_conf ?? null,
            conf_staff_conf: item.confirmation_info?.conf_staff_conf ?? null,
            assignment_info: item.assignment_info ? {
                driver: item.assignment_info.driver || '',
                pick_time: item.assignment_info.pick_time || '',
                pick_date: item.assignment_info.pick_date || '',
                collectors: item.assignment_info.collectors || [],
                truck: item.assignment_info.truck || '',
            } : null,
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return [];
    }
}

export const getAcceptedDetails = async (garb_id: string) => {
    try {
        const { data } = await api.get(`waste/garbage-pickup-view-accepted/${garb_id}/`, {
            params: {
                status: "accepted"
            }
        });

        return {
            garb_id: data.garb_id || '',
            garb_requester: data.garb_requester || '',
            garb_location: data.garb_location || '',
            garb_waste_type: data.garb_waste_type || '',
            garb_created_at: data.garb_created_at || '',
            dec_date: data.dec_date || null,
            truck_id: data.truck_id || null,
            driver_id: data.driver_id || null,
            collector_ids: data.collector_ids || [],
            pickup_assignment_id: data.pickup_assignment_id || null,
            assignment_collector_ids: data.assignment_collector_ids || [],
            assignment_info: data.assignment_info ? {
                driver: data.assignment_info.driver || '',
                pick_time: data.assignment_info.pick_time || '',
                pick_date: data.assignment_info.pick_date || '',
                collectors: data.assignment_info.collectors || [],
                truck: data.assignment_info.truck || '',
            } : null,
            file_url: data.file_url || '',
            sitio_name: data.sitio_name || ''
        };

    } catch (err) {
        console.error('Failed to fetch garbage request details:', err);
        return null; 
    }
}

export const getCompletedDetails = async (garb_id: string) => {
    try {
        const { data } = await api.get(`waste/garbage-pickup-view-completed/${garb_id}/`, {
            params: {
                status: "completed"
            }
        });

        return {
            garb_id: data.garb_id ?? 0,
            garb_requester: data.garb_requester ?? 'Unknown',
            garb_location: data.garb_location ?? '',
            garb_waste_type: data.garb_waste_type ?? '',
            garb_created_at: data.garb_created_at ?? '',
            conf_resident_conf_date: data.confirmation_info?.conf_resident_conf_date ?? null,
            conf_staff_conf_date: data.confirmation_info?.conf_staff_conf_date ?? null,
            conf_resident_conf: data.confirmation_info?.conf_resident_conf ?? null,
            conf_staff_conf: data.confirmation_info?.conf_staff_conf ?? null,
            assignment_info: data.assignment_info ? {
                driver: data.assignment_info.driver || '',
                pick_time: data.assignment_info.pick_time || '',
                pick_date: data.assignment_info.pick_date || '',
                collectors: data.assignment_info.collectors || [],
                truck: data.assignment_info.truck || '',
            } : null,
            file_url: data.file_url || '',
            sitio_name: data.sitio_name || ''
        }
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return null;
    }
}