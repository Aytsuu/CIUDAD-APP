// api.ts
import { api2 } from "@/api/api";

export const getPESections = async () => {
    try {
        const res = await api2.get("patientrecords/pe-section/");
        if (res.data.error) {
            throw new Error(res.data.error);
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching PE sections:", err);
        throw err;
    }
};

export const getPEOptions = async () => {
    try {
        const res = await api2.get("patientrecords/pe-option/");
        if (res.data.error) {
            throw new Error(res.data.error);
        }
        return res.data;
    } catch (err) {
        console.error("Error fetching PE options:", err);
        throw err;
    }
};




export const updatePEOption = async (pe_option_id: number, text: string) => {
    try {
        const res = await api2.put(`patientrecords/update-pe-option/${pe_option_id}/`, { text });
        if (res.data.error) {
            throw new Error(res.data.error);
        }
        return res.data;
    } catch (err) {
        console.error("Error updating PE option:", err);
        throw err;
    }
};


// api.ts
export const createPEResults = async (selectedOptionIds: number[]) => {
    try {
        // Send the IDs directly as an array
        const res = await api2.post("patientrecords/pe-result/", { 
            pe_option: selectedOptionIds,
            find: 1 
        });
        if (res.data.error) {
            throw new Error(res.data.error);
        }
        return res.data;
    } catch (err) {
        console.error("Error saving physical exam results:", err);
        throw err;
    }
};