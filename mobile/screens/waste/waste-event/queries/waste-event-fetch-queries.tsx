import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface WasteEvent {
    we_num: number;
    we_name: string;
    we_location: string;
    we_date: string | null;
    we_time: string;
    we_description?: string;
    we_organizer: string;
    we_invitees?: string;
    we_is_archive: boolean;
    staff: string;
}

export interface WasteEventResponse {
    results: WasteEvent[];
    count: number;
}

// Fetch all waste events
export const useGetWasteEvents = (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    isArchive?: boolean
) => {
    return useQuery({
        queryKey: ['wasteEvents', page, pageSize, search, isArchive],
        queryFn: async (): Promise<WasteEventResponse> => {
            const params = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.toString(),
            });

            if (search) {
                params.append('search', search);
            }

            if (isArchive !== undefined) {
                params.append('is_archive', isArchive.toString());
            }

            const response = await api.get(`waste/waste-event/?${params.toString()}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Fetch single waste event by ID
export const useGetWasteEventById = (weNum: number) => {
    return useQuery({
        queryKey: ['wasteEvent', weNum],
        queryFn: async (): Promise<WasteEvent> => {
            const response = await api.get(`waste/waste-event/${weNum}/`);
            return response.data;
        },
        enabled: !!weNum,
    });
};

// Fetch active waste events (not archived)
export const useGetActiveWasteEvents = (search?: string) => {
    return useQuery({
        queryKey: ['activeWasteEvents', search],
        queryFn: async (): Promise<WasteEvent[]> => {
            const params = new URLSearchParams({
                is_archive: 'false',
            });

            if (search) {
                params.append('search', search);
            }

            const response = await api.get(`waste/waste-event/?${params.toString()}`);
            return response.data.results || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Fetch archived waste events
export const useGetArchivedWasteEvents = (search?: string) => {
    return useQuery({
        queryKey: ['archivedWasteEvents', search],
        queryFn: async (): Promise<WasteEvent[]> => {
            const params = new URLSearchParams({
                is_archive: 'true',
            });

            if (search) {
                params.append('search', search);
            }

            const response = await api.get(`waste/waste-event/?${params.toString()}`);
            return response.data.results || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
