import { api2 } from "@/api/api"

export const getPatients = async () => {
    try {
        const res = await api2.get("patientrecords/patient/")
        return res.data;
    } catch (error) {
        console.error("Error:", error);
    }
}
