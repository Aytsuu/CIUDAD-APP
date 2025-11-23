import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export interface Staff {
    staff_id: string;
    full_name: string;
    position_title?: string;
}

export const getStaffList = async (): Promise<Staff[]> => {
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

