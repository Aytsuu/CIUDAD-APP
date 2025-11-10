import { api } from "@/api/api";
import { WasteCollectionSchedFull } from "../queries/waste-col-fetch-queries";


//Retrieve all Data in Waste Collection
export const getWasteCollectionSchedFull = async (
    page: number = 1, 
    pageSize: number = 10,
    searchQuery?: string, 
    selectedDay?: string,
    isArchive?: boolean
): Promise<{ results: WasteCollectionSchedFull[]; count: number }> => {
    try {
        const params: any = { page, page_size: pageSize };
        if (searchQuery) params.search = searchQuery;
        if (selectedDay && selectedDay !== '0') params.day = selectedDay;
        if (isArchive !== undefined) params.is_archive = isArchive;
        
        const res = await api.get('waste/waste-collection-sched-full/', { params });
        
        // Handle paginated response
        if (res.data.results !== undefined) {
            return {
                results: res.data.results || [],
                count: res.data.count || 0
            };
        }
        
        // Fallback for non-paginated response
        return {
            results: Array.isArray(res.data) ? res.data : [],
            count: Array.isArray(res.data) ? res.data.length : 0
        };
    } catch (err) {
        console.error(err);
        return { results: [], count: 0 };
    }
};



//Waste Collectors
export const getWasteCollectors = async () => {
    try{
        const res = await api.get('waste/waste-collectors/');
        return res.data
    } catch(err){
        console.error(err)
        throw err;
    }
}


// Retrieve Drivers
export const getWasteDrivers = async () => {
    try {
        const res = await api.get('waste/waste-drivers/');
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};


// Retrieve Trucks
export const getWasteTrucks = async () => {
    try {
        const res = await api.get('waste/waste-trucks/');
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}


//Retrieve Sitio
export const getSitio = async () => {
    try {
        const res = await api.get('waste/sitio/');
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}