import api from "@/pages/api/api";

export const getEvent_meetingreq = async () => {
    try {
        const res = await api.get('council/event-meeting/');
        
        // Handle empty/undefined responses
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error:", err);
        return [];  // Always return an array
    }
};