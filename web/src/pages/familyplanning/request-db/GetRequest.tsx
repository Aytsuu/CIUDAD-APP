import api from "@/api/api"

export const getFPprofiling = async() => {
    try{
        const response = await api.get('family-planning/fp_type');
        const patientData = response.data
    
    } catch (err) {
        console.error("Error fetching data:", err);
        return [];
    }
    return patientData;
}

export const getRiskSti = async() => {
    try{
        const response = await api.get('family-planning/risk_sti');
        return response.data;
    }
}