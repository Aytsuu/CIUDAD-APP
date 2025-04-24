import { api } from "@/api/api"

export const getPatients = async () => {
    try {
        const res = await api.get("patientrecords/patient/")
        return res.data;
    } catch (error) {
        console.error("Error:", error);
    }
}

// export const getSpouse = async (pat_id: number | string) => {
//     try {
//         const res = await api.get(`patientrecords/spouse/${pat_id}/`)
//         return res.data
//     } catch (error) {
//         console.error("Error: ", error)
//         throw error;
//     }
// }