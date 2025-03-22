import api from "@/api/api";


export const getdonationreq = async () => {
    try {

        const res = await api.get('donation/donation-record/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};