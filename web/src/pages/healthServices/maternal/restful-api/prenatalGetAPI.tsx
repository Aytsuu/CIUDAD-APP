import { api } from "@/api/api"

export const getPatients = async () => {
    try {
        const res = await api.get("patientrecords/patient/")
        return res.data;
    } catch (error) {
        console.error("Error:", error);
    }
}