import {api} from "@/api/api";


export const getInvoice = async () => {
    try {

        const res = await api.get('treasurer/invoice/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};