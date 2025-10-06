import {api2} from "@/api/api"

export const getFPprofiling = async() => {
    try{
        const response = await api2.get('family-planning/fp_type');
        const patientData = response.data
    
    } catch (err) {
        console.error("Error fetching data:", err);
        return [];
    }
    return [];
}

export const getRiskSti = async() => {
    try{
        const response = await api2.get('family-planning/risk_sti');
        return response.data;
    } catch (err) {
        console.error("Error fetching risk STI data:", err);
        return [];
    }
}