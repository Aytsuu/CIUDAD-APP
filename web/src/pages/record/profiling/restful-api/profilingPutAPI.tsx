import api from "@/api/api";

export const updateProfile = async (perId: string, data: Record<string, string>) => {
    try {
        console.log(data)
        const res = await api.put(`profiling/personal/${perId}/`, data)
        return res.data;

    } catch (err) {
        console.error(err);
    }
}