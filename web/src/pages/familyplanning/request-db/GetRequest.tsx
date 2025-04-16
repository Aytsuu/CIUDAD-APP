import api from "@/api/api"

export const getFP = async() => {
    try{
        const res = await api.get('familyplanning/fp_type');
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Error fetching data:", err);
        return [];
    }
}