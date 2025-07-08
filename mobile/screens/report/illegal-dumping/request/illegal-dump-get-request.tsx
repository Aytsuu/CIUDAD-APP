import { api } from "@/api/api";


//======================= Resident's End =================

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



// ==================  Staff's End =======================


//Waste Report Record
export const getWasteReport = async () => {
    try {

        const res = await api.get('waste/waste-report/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};