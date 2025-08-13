import { api } from "@/api/api";

// Fetch permit clearances
export const getPermitClearances = async () => {
    try {
        const response = await api.get('/clerk/permit-clearances/');
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch permit clearances:", error);
        throw new Error(error.response?.data?.detail || "Failed to fetch permit clearances");
    }
};
