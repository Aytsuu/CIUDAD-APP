import { api2 } from "@/api/api";

interface PrenatalAppointmentUpdateData {
      cancelled_at: string | null;
      status: string;
}

export const updatePrenatalAppointment = async (par_id: string, data: PrenatalAppointmentUpdateData) => {
    try {
        const response = await api2.put(`/maternal/prenatal/appointment/cancel/${par_id}/`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating prenatal appointment: ${error}`);
        throw error;
    }
}