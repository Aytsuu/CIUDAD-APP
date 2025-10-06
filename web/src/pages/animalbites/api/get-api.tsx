import { api } from "@/api/api"

export const getAnimalbitePatients = async () => {
    try{
        const res = await api.get("patientsrecord/patient")
        return res.data
    } catch (error){
        console.error("Error:",error)
    }
}