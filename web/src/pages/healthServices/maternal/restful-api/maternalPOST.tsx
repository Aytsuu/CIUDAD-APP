import { api2 } from "@/api/api"
import axios from "axios";

interface PrenatalRecord {
    pf_lmp: string; 
    pf_edc: string;
    patrec_id: number; 
}

export const addPrenatalRecord = async (data: PrenatalRecord) => {
    try {
        if (!data.patrec_id) {
            console.error("Missing Patient Record ID (patrec_id) in form data")
            throw new Error("Patient Record ID is required")
        }

        console.log("Sending Prenatal Record Data: ", data)
        const res = await api2.post("maternal/prenatal_record/", data)
        
        return res.data.pf_id
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Prenatal Records Error: ", error.response?.data || error.message)
        } else {
            console.error("Unexpected Error: ", error)
        }
        throw error
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
