import { api2 } from "@/pages/api/api"
import axios from "axios";

export const addPrenatalRecord = async (data: Record<string, string>) => {
    try {
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
        const res = await api2.post("maternal/prenatal_record/", requestData) 
        
        return res.data.pf_id;
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.error("Records Error: ", error.response?.data || error.message)
        } else{
            console.error("Unexpected Error: ", error)
        }

    }
}

interface SpouseData {
    spouse_type: string
    spouse_lname: string
    spouse_fname: string
    spouse_mnane?: string
    spouse_occupation: string
    pat_id: number
}

export const addSpouse = async (spouseData: SpouseData) => {
    try {
        console.log("Sending Spouse Data: ", spouseData)
        const res = await api2.post("patientrecords/spouse/create/", spouseData)
        return res.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Spouse Creation Error: ", error.response?.data || error.message)
        } else {
            console.error("Unexpected Error: ", error)
        }
        throw error
    }
}
