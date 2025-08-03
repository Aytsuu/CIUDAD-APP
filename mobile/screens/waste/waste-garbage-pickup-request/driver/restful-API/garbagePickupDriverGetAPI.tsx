import { api } from "@/api/api";

export const getGarbagePickupTasks = async (driver_id: string) => {
    try{
        const {data} = await api.get('waste/driver-garbage-pickup-tasks/', {
            params: {
                wstp_id: driver_id,
                status: "accepted"
            }
        })

        return data.map((item: any) => ({   
            garb_id: item.garb_id || '',
            garb_requester: item.garb_requester || '',
            garb_location: item.garb_location || '',
            garb_waste_type: item.garb_waste_type || '',
            dec_date: item.dec_date || null,
            assignment_info: item.assignment_info ? {
                pick_time: item.assignment_info.pick_time || '',
                pick_date: item.assignment_info.pick_date || '',
                collectors: item.assignment_info.collectors || [],
                truck: item.assignment_info.truck || '',
            } : null,
            file_url: item.file_url || '',
            sitio_name: item.sitio_name || ''
        }));
    }catch(err){
        console.error(err)
    }
}