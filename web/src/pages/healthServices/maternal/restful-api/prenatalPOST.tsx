import api from "@/pages/api/api"
import axios from "axios";
// import { toTitleCase } from "../case"

export const addPrenatalRecord = async (data: Record<string, string>) => {
    try {
        //check patient id 
        if(!data.patrec_id){
            console.error("Missing Patient ID (pat_id) in form data")
            throw new Error("Patient ID is required")
        }

        const requestData: Record<string, any> = {
            pf_lmp: data.pf_lmp,
            pf_edc: data.pf_edc,
            patrec_id: data.patrec_id,
        };
        console.log("Sending Prenatal Record Data: ", requestData)
        const res = await api.post("maternal/prenatal_record/", requestData) 
        
        return res.data.pf_id;
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error("Records Error: ", error.response?.data || error.message)
        } else{
            console.error("Unexpected Error: ", error)
        }

    }
}