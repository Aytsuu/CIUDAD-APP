import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export interface WasteEvent {
    we_num: number;
    we_name: string;
    we_location: string;
    we_date: string | null;
    we_time: string | null;
    we_description: string;
    we_organizer: string;
    we_invitees: string;
    we_is_archive: boolean;
    staff: string | null;
}

export const createWasteEvent = async (eventData: Omit<WasteEvent, 'we_num'>) => {
    try {
        console.log("Waste Event Data:", eventData);
        const response = await api.post('/waste/waste-event/', eventData);
        return response.data;
    } catch (error: any) {
        console.error("Error creating waste event:", error);
        console.error('Error details:', error.response?.data || 'No error details available');
        throw error;
    }
};

export const getWasteEvents = async () => {
    try {
        const response = await api.get('/waste/waste-event/');
        return response.data;
    } catch (error) {
        console.error("Error fetching waste events:", error);
        throw error;
    }
}; 