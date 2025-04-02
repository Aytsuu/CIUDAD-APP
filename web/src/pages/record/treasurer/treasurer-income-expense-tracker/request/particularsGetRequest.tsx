import api from "@/api/api";


export const getParticulars = async () => {
    try {

        const res = await api.get('treasurer/get-particular/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};