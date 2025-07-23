import {api} from "@/api/api";


export const getTemplateRecord = async () => {
    try {

        const res = await api.get('council/template/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};