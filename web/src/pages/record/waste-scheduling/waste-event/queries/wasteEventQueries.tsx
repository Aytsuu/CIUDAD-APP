import { api } from "@/api/api";

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
    staff: number | null;
}

export const createWasteEvent = async (eventData: Omit<WasteEvent, 'we_num'>) => {
    try {
        const response = await api.post('/waste/waste-event/', eventData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWasteEvents = async () => {
    try {
        const response = await api.get('/waste/waste-event/');
        return response.data;
    } catch (error) {
        throw error;
    }
}; 