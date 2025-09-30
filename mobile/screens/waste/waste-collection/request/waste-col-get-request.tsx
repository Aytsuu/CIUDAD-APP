import { api } from "@/api/api";



//Retrieve all Data in Waste Collection
export const getWasteCollectionSchedFull = async (searchQuery?: string, selectedDay?: string) => {
    try {
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (selectedDay && selectedDay !== '0') params.day = selectedDay;
        
        const res = await api.get('waste/waste-collection-sched-full/', { params });
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
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