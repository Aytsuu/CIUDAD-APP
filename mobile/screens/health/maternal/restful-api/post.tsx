import { api2 } from "@/api/api";
import axios from "axios";

interface PrenatalAppointmentData {
    requested_at: string;
    confirmed_at: string | null;
    status: string;
    rp_id: string;
    pat_id: string;
}

export const addPrenatalAppointment = async (data: PrenatalAppointmentData) => {
    try {
        const response = await api2.post('/maternal/prenatal/appointment/request/', data);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error creating prenatal appointments:", error.response?.data || error.message)
        } else {
            console.error("Unexpected Error: ", error)
        }
        throw error
    }
}