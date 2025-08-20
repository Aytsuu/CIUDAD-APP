import {api} from "@/api/api";


export const getInvoice = async () => {
    try {

        const res = await api.get('treasurer/invoice/');
        console.log("INVOICES MAEM: ", res)
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};