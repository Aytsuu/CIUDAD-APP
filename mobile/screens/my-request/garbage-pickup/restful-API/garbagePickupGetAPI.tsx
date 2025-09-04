import { api } from "@/api/api";

export const getGarbagePendingResident = async (rp_id: string) => {
    try {
        const {data} = await api.get(`/waste/garbage-pickup-pending/${rp_id}/`)

        return data.map((item: any) => ({   
            garb_id: item.garb_id,
            garb_location: item.garb_location,
            garb_waste_type: item.garb_waste_type,
            garb_pref_date: item.garb_pref_date,
            garb_pref_time: item.garb_pref_time,
            garb_created_at: item.garb_created_at,
            garb_additional_notes: item.garb_additional_notes,
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));
    }catch (err){
        console.error('API Error:', err)
        throw err;
    }
}


export const getGarbageRejectedResident = async (rp_id: string) => {
    try{

        const {data} = await api.get(`/waste/garbage-pickup-rejected/${rp_id}/`)
        
        return data.map((item: any) => ({
            garb_id: item.garb_id || '', 
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            garb_created_at: item.garb_created_at || '',
            garb_pref_date: item.garb_pref_date,
            garb_pref_time: item.garb_pref_time,
            garb_additional_notes: item.garb_additional_notes,
            dec_id: item.dec_id || null, 
            dec_date: item.dec_date || null,
            dec_reason: item.dec_reason || '',
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}


export const getGarbageAcceptedResident = async (rp_id: string) => {
    try{

        const {data} = await api.get(`/waste/garbage-pickup-accepted/${rp_id}/`)

        return data.map((item: any) => ({
        garb_id: item.garb_id || '',
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
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}


export const getGarbageCompletedResident = async (rp_id: string) => {
    try{
        const {data} = await api.get(`/waste/garbage-pickup-completed/${rp_id}/`)

        return data.map((item: any) => ({
            garb_id: item.garb_id ?? 0,
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
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}


export const getGarbageCancelledResident = async (rp_id: string) => {
    try{

        const {data} = await api.get(`/waste/garbage-pickup-cancelled/${rp_id}/`)

        return data.map((item: any) => ({
            garb_id: item.garb_id || '', 
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            garb_created_at: item.garb_created_at || '',
            garb_pref_date: item.garb_pref_date,
            garb_pref_time: item.garb_pref_time,
            garb_additional_notes: item.garb_additional_notes,
            dec_id: item.dec_id || null, 
            dec_date: item.dec_date || null,
            dec_reason: item.dec_reason || '',
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}