import {api} from "@/api/api";

export const updateCertificationStatus = async (cr_id: string) => {

    try{
        console.log({
            cr_req_status: "Completed",
        })

        const res = await api.put(`clerk/certificate-update-status/${cr_id}/`,{
            cr_req_status: "Completed",
            cr_date_completed: new Date().toISOString()
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}