import {api} from "@/api/api";


export const getTemplateRecord = async () => {
    try {

        const res = await api.get('council/template/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};


export const getPurposeRates = async () => {
    try {

        const res = await api.get('council/purpose-rates-view/');
        console.log("GETTTTT REQ PURPOSE: ", res)
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};