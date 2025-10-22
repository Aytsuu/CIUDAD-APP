import { api2 } from "@/api/api";
import { useMutation } from "@tanstack/react-query";


// In ../queries/update.ts - FIX THIS
export const useUpdateFollowupStatus = () => {
    return useMutation({
      mutationFn: async ({ followv_id, status }: { followv_id: string; status: string }) => {
        const response = await api2.patch(`child-health/followups/${followv_id}/`, { 
            followv_status: status  // Change 'status' to 'followv_status'
        });
        return response.data;
      }
    });
};