import {api} from "@/api/api";


export const getResolution = async () => {
    try {

        const res = await api.get('council/resolution/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};



export const getApprovedProposals = async () => {
    try {

        const res = await api.get('council/approved-proposals/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};