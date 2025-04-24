import api from '@/pages/api/api';


export const getbudgettrackreq = async () => {
    try {
        const res = await api.get('/gad/gad-budget-tracker-table/:year/');
        
        // Handle empty/undefined responses
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error:", err);
        return [];  // Always return an array
    }
};