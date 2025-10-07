import { api2 } from "@/api/api"

export const updatePatient = async (patientId: string, patientData: any) => {
    try {
        const res = await api2.patch(`patientrecords/patient/${patientId}/update/`, patientData);
        if (res.status !== 200) {
            throw new Error("Failed to update patient record");
        }
        console.log("Patient updated:", res.data);
        return res.data;
    } catch (error) {
        console.error("Error updating patient:", error);
        throw error;
    }
}
