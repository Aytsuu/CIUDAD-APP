import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export interface WasteEvent {
    we_num: number;
    we_name: string;
    we_location: string;
    we_date: string | null;
    we_time: string | null;
    we_description: string;
    we_organizer: string;
    we_invitees: string | null;
    we_is_archive: boolean;
    staff: string | null;
}

export interface Staff {
    staff_id: string;
    full_name: string;
    position_title?: string;
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

export const getWasteEvents = async (isArchive?: boolean) => {
    try {
        const params: any = {};
        if (isArchive !== undefined) {
            params.is_archive = isArchive;
        }
        const response = await api.get('/waste/waste-event/', { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching waste events:", error);
        throw error;
    }
};

export const useGetWasteEvents = (isArchive?: boolean) => {
    return useQuery<WasteEvent[], Error>({
        queryKey: ["wasteEvents", isArchive],
        queryFn: () => {
            return getWasteEvents(isArchive).then((data) => {
                // Handle both array and paginated response formats
                return Array.isArray(data) ? data : data?.results || [];
            });
        },
        staleTime: 1000 * 60 * 5,
    });
};

export const getStaffList = async () => {
    try {
        const res = await api.get('donation/dist/staff/');
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        return [];
    }
};

export const useGetStaffList = () => {
    return useQuery<Staff[], Error>({
        queryKey: ["staffList"],
        queryFn: () => getStaffList(),
        staleTime: 1000 * 60 * 5,
    });
}; 