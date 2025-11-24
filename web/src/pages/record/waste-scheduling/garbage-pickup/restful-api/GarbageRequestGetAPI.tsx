import { api } from "@/api/api";


export const getDrivers = async () => {
    try {
        const res = await api.get('waste/waste-drivers/');
        return res.data;
    } catch (err) {
        // console.error(err);
        throw err;
    }
};

export const getTrucks = async () => {
    try {
        const res = await api.get('waste/all-trucks/');
        return res.data;
    } catch (err) {
        // console.error(err);
        throw err;
    }
}

export const getCollectors = async () => {
    try{
        const res = await api.get('waste/waste-collectors/');
        return res.data
    } catch(err){
        // console.error(err)
        throw err;
    }
}

export const getGarbagePendingRequest = async ( page: number, pageSize: number, searchQuery: string, selectedSitio: string
  ) => {
    try {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        search: searchQuery,
      };
  
      if (selectedSitio && selectedSitio !== "0") {
        params.sitio = selectedSitio;
      }
  
      const { data } = await api.get("waste/garbage-pickup-request-pending/", {
        params,
      });
  
      const items = data.results || [];
  
      return {
        results: items.map((item: any) => ({
          garb_id: item.garb_id,
          garb_requester: item.garb_requester || "",
          garb_location: item.garb_location,
          garb_waste_type: item.garb_waste_type,
          garb_pref_date: item.garb_pref_date,
          garb_pref_time: item.garb_pref_time,
          garb_created_at: item.garb_created_at,
          garb_additional_notes: item.garb_additional_notes,
          file_url: item.file_url || "",
          sitio_name: item.sitio_name || "",
        })),
        count: data.count || 0,
      };
    } catch (err) {
    //   console.error("Failed to fetch garbage requests:", err);
      throw err
    }
  };
  

export const getGarbageRejectedRequest = async (page: number, pageSize: number, searchQuery: string, selectedSitio: string) => {
    try {
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (selectedSitio && selectedSitio !== "0") {
            params.sitio = selectedSitio;
        }
    
        const { data } = await api.get("waste/garbage-pickup-request-rejected/", {
            params,
        });
    

        const items = data.results || [];

        return {
            results: items.map((item: any) => ({
                garb_id: item.garb_id || '', 
                garb_requester: item.garb_requester || '',
                garb_location: item.garb_location || '',
                garb_waste_type: item.garb_waste_type || '',
                garb_created_at: item.garb_created_at || '',
                garb_pref_date: item.garb_pref_date || '',
                garb_pref_time: item.garb_pref_time || '',
                garb_additional_notes: item.garb_additional_notes || '',
                dec_id: item.dec_id || null, 
                dec_date: item.dec_date || null,
                dec_reason: item.dec_reason || '',
                file_url: item.file_url || '',
                sitio_name: item.sitio_name || '',
                staff_name: item.staff_name || ''
            })),
            count: data.count || 0
        };
    } catch (err) {
        // console.error('Failed to fetch garbage requests:', err);
        throw err
    }
}

export const getGarbageAcceptedRequest = async (page: number, pageSize: number, searchQuery: string, selectedSitio: string) => {
    try {
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (selectedSitio && selectedSitio !== "0") {
            params.sitio = selectedSitio;
        }
    
        const { data } = await api.get("waste/garbage-pickup-request-accepted/", {
            params,
        });

        const items = data.results || [];

        return {
            results: items.map((item: any) => ({
                garb_id: item.garb_id || '',
                garb_requester: item.garb_requester || '',
                garb_location: item.garb_location || '',
                garb_waste_type: item.garb_waste_type || '',
                garb_created_at: item.garb_created_at || '',
                garb_pref_time: item.garb_pref_time || '',
                garb_pref_date: item.garb_pref_date || '',
                garb_additional_notes: item.garb_additional_notes,
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
                sitio_name: item.sitio_name || '',
                staff_name: item.staff_name || ''
            })),
            count: data.count || 0
        };

    } catch (err) {
        // console.error('Failed to fetch garbage requests:', err);
        throw err
    }
}

export const getGarbageCompletedRequest = async (page: number, pageSize: number, searchQuery: string, selectedSitio: string) => {
    try {
        const params: Record<string, any> = {
            page,
            page_size: pageSize,
            search: searchQuery,
        };
    
        if (selectedSitio && selectedSitio !== "0") {
            params.sitio = selectedSitio;
        }
    
        const { data } = await api.get("waste/garbage-pickup-request-completed/", {
            params,
        });
    

        const items = data.results || [];

        return {
            results: items.map((item: any) => ({
                garb_id: item.garb_id ?? 0,
                garb_requester: item.garb_requester ?? 'Unknown',
                garb_location: item.garb_location ?? '',
                garb_waste_type: item.garb_waste_type ?? '',
                garb_created_at: item.garb_created_at ?? '',
                garb_pref_time: item.garb_pref_time || '',
                garb_pref_date: item.garb_pref_date || '',
                garb_additional_notes: item.garb_additional_notes,
                conf_resident_conf_date: item.confirmation_info?.conf_resident_conf_date ?? null,
                conf_staff_conf_date: item.confirmation_info?.conf_staff_conf_date ?? null,
                conf_resident_conf: item.confirmation_info?.conf_resident_conf ?? null,
                conf_staff_conf: item.confirmation_info?.conf_staff_conf ?? null,
                dec_date: item.dec_date || null,
                assignment_info: item.assignment_info ? {
                    driver: item.assignment_info.driver || '',
                    pick_time: item.assignment_info.pick_time || '',
                    pick_date: item.assignment_info.pick_date || '',
                    collectors: item.assignment_info.collectors || [],
                    truck: item.assignment_info.truck || '',
                } : null,
                file_url: item.file_url || '',
                sitio_name: item.sitio_name || '',
                staff_name: item.staff_name || ''
            })),
            count: data.count || 0
        };
    } catch (err) {
        // console.error('Failed to fetch garbage requests:', err);
        throw err
    }
}