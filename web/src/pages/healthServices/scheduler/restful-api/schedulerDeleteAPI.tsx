import { api2 } from "@/api/api";
import axios from "axios";


export const deleteService = async(serviceId: number) => {
	try {
		const res = await api2.delete(`servicescheduler/services/${serviceId}/delete/`);
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Service Deletion Error: ", error.response?.data || error.message);
		} else {
			console.error("Unexpected Error: ", error);
		}
		throw error;
	}
}


export const deleteDay = async(dayId: number) => {
	try {
		const res = await api2.delete(`servicescheduler/days/${dayId}/delete/`)
		return res.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.error("Day deletion error: ", error.response?.data || error.message);
			console.error("Status:", error.response?.status);
            console.error("Full response:", error.response);
		} else {
			console.error("Unexpected error: ", error);
		}
		throw error;
	}
}