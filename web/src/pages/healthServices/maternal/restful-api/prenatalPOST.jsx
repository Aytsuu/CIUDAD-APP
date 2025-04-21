import api from "@/pages/api/api"
// import { toTitleCase } from "../case"

export const addPrenatalRecord = async () => {
    try {
        const res = await api.post("maternal/prenatal/")
    } catch (error) {
        
    }
}