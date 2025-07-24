import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

    export type UpcomingHotspots = {
        wh_num: string;
        wh_date: string;
        wh_start_time: string;
        wh_end_time: string;
        wh_add_info: string;
        wh_is_archive: boolean;
        sitio: string;
        watchman: string;
        sitio_id: string;
        wstp_id: string;
    }

    export const useGetUpcomingHotspots = () => {
        return useQuery<UpcomingHotspots[]>({
            queryKey: ['hotspots'],
            queryFn: async () => {
                try {
                    const res = await api.get('waste/upcoming-hotspots/');
                    console.log('upcoming hotspots: ', res.data)
                    return res.data;
                } catch (err) {
                    throw err;
                }
            },
            staleTime: 5000
            
        })
    }