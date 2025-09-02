import { api } from "@/api/api";

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


//Retrieve all Data in Waste Collection
export const getWasteCollectionSchedFull = async () => {
    try {
        const res = await api.get('waste/waste-collection-sched-full/');
        console.log("Raw API response:", res.data); 
        return res.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};