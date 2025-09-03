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