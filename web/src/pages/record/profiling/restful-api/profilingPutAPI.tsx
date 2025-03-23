import api from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const updateProfile = async (perId: string, data: Record<string, string>) => {
    try {

        const res = await api.put(`profiling/personal/${perId}/`, capitalizeAllFields(data))
        return res.data;

    } catch (err) {
        console.error(err);
    }
}