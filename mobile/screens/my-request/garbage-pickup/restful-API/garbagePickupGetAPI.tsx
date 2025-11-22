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
            sitio_name: item.sitio_name || ''
        }));
    }catch (err){
        throw err;
    }
}

export const getGarbagePendingRequestDetailsResident = async (garb_id: string) => {
    try {
        const res = await api.get(`waste/garbage-pickup-view-pending/${garb_id}/`)
        return res.data
    } catch (err) {
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
            sitio_name: item.sitio_name || '',
            staff_name: item.staff_name || ''
        }));
    }catch(err){
        throw err;
    }
}

export const getGarbageRejectedRequestDetailsResident = async (garb_id: string) => {
    try {
        const res = await api.get(`waste/garbage-pickup-view-rejected/${garb_id}/`)
        return res.data
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        throw err;
    }
}


export const getGarbageAcceptedResident = async (rp_id: string) => {
    try {
        const { data } = await api.get(`/waste/garbage-pickup-accepted/${rp_id}/`);

        return data.map((item: any) => ({
            garb_id: item.garb_id || '',
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            garb_created_at: item.garb_created_at || '',
            garb_pref_date: item.garb_pref_date,
            garb_pref_time: item.garb_pref_time,
            garb_additional_notes: item.garb_additional_notes || '',
            garb_req_status: item.garb_req_status || '', 
            garb_requester: item.garb_requester || 'Unknown', 
            dec_date: item.dec_date || null,
            assignment_info: item.assignment_info ? {
                driver: item.assignment_info.driver || '',
                pick_time: item.assignment_info.pick_time || '',
                pick_date: item.assignment_info.pick_date || '',
                collectors: item.assignment_info.collectors || [],
                truck: item.assignment_info.truck || '',
            } : null,
            confirmation_info: item.confirmation_info ? { 
                conf_resident_conf: item.confirmation_info.conf_resident_conf || false,
                conf_resident_conf_date: item.confirmation_info.conf_resident_conf_date || null,
            } : null,
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || '',
        }));
    } catch(err) {
        console.error('API Error:', err);
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
            sitio_name: item.sitio_name || ''
        }));
    }catch(err){
        console.error('API Error:', err)
        throw err;
    }
}

export const getGarbageCancelledDetailsResident = async (garb_id: string) => {
    try{

        const res = await api.get(`/waste/garbage-pickup-cancelled-detail/${garb_id}/`)
        return res.data
    }catch(err){
        throw err;
    }
}

export const getAcceptedDetailsResident = async (garb_id: string) => {
    try {
        const { data } = await api.get(`waste/garbage-pickup-accepted-detail/${garb_id}/`);
        return {
            garb_id: data.garb_id || '',
            garb_location: data.garb_location || '',
            garb_waste_type: data.garb_waste_type || '',
            garb_created_at: data.garb_created_at || '',
            garb_pref_date: data.garb_pref_date,
            garb_pref_time: data.garb_pref_time,
            garb_additional_notes: data.garb_additional_notes || '',
            garb_req_status: data.garb_req_status || '',
            garb_requester: data.garb_requester || 'Unknown',
            dec_date: data.dec_date || null,
            assignment_info: data.assignment_info ? {
                driver: data.assignment_info.driver || '',
                pick_time: data.assignment_info.pick_time || '',
                pick_date: data.assignment_info.pick_date || '',
                truck: data.assignment_info.truck || '',
                collectors: data.assignment_info.collectors || [], // Added
            } : null,
            confirmation_info: data.confirmation_info ? {
                conf_resident_conf: data.confirmation_info.conf_resident_conf || false,
                conf_resident_conf_date: data.confirmation_info.conf_resident_conf_date || null,
                conf_staff_conf: data.confirmation_info.conf_staff_conf || false, // Added
                conf_staff_conf_date: data.confirmation_info.conf_staff_conf_date || null, // Added
            } : null,
            file_url: data.file_url || '',
            sitio_name: data.sitio_name || '',
            staff_name: data.staff_name || ''
        };
    } catch (err) {
        console.error('Failed to fetch garbage request details:', err);
        return null; 
    }
}


export const getCompletedDetailsResident = async (garb_id: string) => {
    try {
        const { data } = await api.get(`waste/garbage-pickup-view-completed/${garb_id}/`);

        return {
            garb_id: data.garb_id ?? 0,
            garb_location: data.garb_location ?? '',
            garb_waste_type: data.garb_waste_type ?? '',
            garb_created_at: data.garb_created_at ?? '',
            garb_pref_date: data.garb_pref_date,
            garb_pref_time: data.garb_pref_time,
            garb_additional_notes: data.garb_additional_notes || '',
            conf_resident_conf_date: data.confirmation_info?.conf_resident_conf_date ?? null,
            conf_staff_conf_date: data.confirmation_info?.conf_staff_conf_date ?? null,
            conf_resident_conf: data.confirmation_info?.conf_resident_conf ?? null,
            conf_staff_conf: data.confirmation_info?.conf_staff_conf ?? null,
            dec_date: data.dec_date || null,
            assignment_info: data.assignment_info ? {
                driver: data.assignment_info.driver || '',
                pick_time: data.assignment_info.pick_time || '',
                pick_date: data.assignment_info.pick_date || '',
                collectors: data.assignment_info.collectors || [],
                truck: data.assignment_info.truck || '',
            } : null,
            file_url: data.file_url || '',
            sitio_name: data.sitio_name || '',
            staff_name: data.staff_name || ''
        }
    } catch (err) {
        console.error('Failed to fetch garbage requests:', err);
        return null;
    }
}


