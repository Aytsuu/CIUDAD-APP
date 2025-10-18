import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export type CouncilEvent = {
  ce_id: number;
  ce_title: string;
  ce_place: string;
  ce_date: string;
  ce_time: string;
  ce_type: string;
  ce_description: string;
  ce_is_archive: boolean;
  staff_id: string | null;
};

export const getCouncilEvents = async () => {
  try {
    const res = await api.get('council/event-meeting/', {
      params: { is_archive: false },
    });
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error fetching council events:", err);
    return [];
  }
};

export const useGetCouncilEvents = () => {
  return useQuery<CouncilEvent[], Error>({
    queryKey: ["councilEvents"],
    queryFn: () => getCouncilEvents().catch((error) => {
      console.error("Error fetching council events:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
